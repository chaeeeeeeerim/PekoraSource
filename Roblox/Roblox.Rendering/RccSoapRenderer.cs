using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Xml.Linq;

namespace Roblox.Rendering;

/// <summary>
/// Calls the bundled RCCService 2020 SOAP endpoint for catalog thumbnail jobs.
/// Only fixed, repository-owned Lua scripts can be submitted; callers cannot supply Lua source.
/// </summary>
internal static class RccSoapRenderer
{
    private static readonly HttpClient Client = new()
    {
        Timeout = TimeSpan.FromSeconds(120),
    };

    private static readonly XNamespace Soap = "http://schemas.xmlsoap.org/soap/envelope/";

    public static bool Supports(string type) =>
        type is "Hat" or "Mesh" or "Model" or "Image";

    public static async Task<string> RenderAsync(
        string type,
        long assetId,
        string baseUrl,
        int width,
        int height,
        CancellationToken cancellationToken = default)
    {
        if (!Supports(type))
            throw new NotSupportedException("RCCService 2020 rendering is not configured for " + type + ".");

        if (assetId <= 0)
            throw new ArgumentOutOfRangeException(nameof(assetId));

        if (!Uri.TryCreate(baseUrl, UriKind.Absolute, out var publicBase) ||
            publicBase.Scheme is not ("http" or "https"))
            throw new InvalidOperationException("Roblox.Configuration.BaseUrl must be an absolute HTTP(S) URL.");

        var endpoint = GetPrivateEndpoint();
        var soapNamespace = Environment.GetEnvironmentVariable("RCC_SOAP_NAMESPACE") ?? "http://roblox.com/";
        if (!Uri.TryCreate(soapNamespace, UriKind.Absolute, out _))
            throw new InvalidOperationException("RCC_SOAP_NAMESPACE must be an absolute URI.");

        var scriptRoot = GetScriptRoot();
        var script = await File.ReadAllTextAsync(Path.Combine(scriptRoot, type + ".lua"), cancellationToken);
        var jobId = Guid.NewGuid().ToString("D");
        var assetUrl = publicBase.ToString().TrimEnd('/') + "/asset/?id=" + assetId;

        var args = type == "Image"
            ? new[]
            {
                LuaValue.String(assetId.ToString()),
                LuaValue.String(publicBase.ToString().TrimEnd('/')),
                LuaValue.String("png"),
                LuaValue.Number(width),
                LuaValue.Number(height),
            }
            : new[]
            {
                LuaValue.String(assetUrl),
                LuaValue.String("png"),
                LuaValue.Number(width),
                LuaValue.Number(height),
                LuaValue.String(publicBase.ToString().TrimEnd('/')),
            };

        try
        {
            var response = await PostSoapAsync(endpoint, BuildOpenJob(soapNamespace, jobId, type, script, args), cancellationToken);
            return ReadImageResult(response);
        }
        finally
        {
            try
            {
                await PostSoapAsync(endpoint, BuildCloseJob(soapNamespace, jobId), cancellationToken);
            }
            catch
            {
                // Expiration is the fallback if the RCC worker has already closed the job.
            }
        }
    }

    private static Uri GetPrivateEndpoint()
    {
        var value = Environment.GetEnvironmentVariable("RCC_SOAP_ENDPOINT");
        if (!Uri.TryCreate(value, UriKind.Absolute, out var endpoint) ||
            endpoint.Scheme is not ("http" or "https") ||
            endpoint.UserInfo.Length != 0)
            throw new InvalidOperationException("Set RCC_SOAP_ENDPOINT to the private RCCService 2020 SOAP URL.");

        if (!IsPrivateHost(endpoint.Host))
            throw new InvalidOperationException("RCC_SOAP_ENDPOINT must use localhost or a private/VPN IP. Never expose RCC SOAP to the public internet.");

        return endpoint;
    }

    private static bool IsPrivateHost(string host)
    {
        if (string.Equals(host, "localhost", StringComparison.OrdinalIgnoreCase))
            return true;
        if (!IPAddress.TryParse(host, out var ip))
            return false;
        if (IPAddress.IsLoopback(ip))
            return true;

        var bytes = ip.GetAddressBytes();
        if (ip.AddressFamily == AddressFamily.InterNetwork)
        {
            return bytes[0] == 10 ||
                   (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) ||
                   (bytes[0] == 192 && bytes[1] == 168) ||
                   (bytes[0] == 100 && bytes[1] >= 64 && bytes[1] <= 127);
        }

        return ip.AddressFamily == AddressFamily.InterNetworkV6 &&
               (bytes[0] & 0xFE) == 0xFC;
    }

    private static string GetScriptRoot()
    {
        var configured = Environment.GetEnvironmentVariable("RCC_SOAP_SCRIPTS_DIRECTORY");
        if (!string.IsNullOrWhiteSpace(configured) &&
            File.Exists(Path.Combine(configured, "Hat.lua")))
            return configured;

        for (var directory = new DirectoryInfo(Directory.GetCurrentDirectory());
             directory != null;
             directory = directory.Parent)
        {
            var candidate = Path.Combine(directory.FullName, "RCCService", "RCCService2020", "internalscripts", "thumbnails");
            if (File.Exists(Path.Combine(candidate, "Hat.lua")))
                return candidate;
        }

        throw new DirectoryNotFoundException(
            "RCCService 2020 thumbnail scripts were not found. Set RCC_SOAP_SCRIPTS_DIRECTORY to RCCService/RCCService2020/internalscripts/thumbnails.");
    }

    private static XDocument Envelope(string soapNamespace, XElement body) =>
        new(
            new XElement(Soap + "Envelope",
                new XAttribute(XNamespace.Xmlns + "soapenv", Soap),
                new XAttribute(XNamespace.Xmlns + "rob", soapNamespace),
                new XElement(Soap + "Header"),
                new XElement(Soap + "Body", body)));

    private static XDocument BuildOpenJob(
        string soapNamespace,
        string jobId,
        string scriptName,
        string script,
        IEnumerable<LuaValue> arguments)
    {
        XNamespace rob = soapNamespace;
        return Envelope(soapNamespace,
            new XElement(rob + "OpenJob",
                new XElement(rob + "job",
                    new XElement(rob + "id", jobId),
                    new XElement(rob + "expirationInSeconds", "120"),
                    new XElement(rob + "cores", "1")),
                new XElement(rob + "script",
                    new XElement(rob + "name", scriptName),
                    new XElement(rob + "script", new XCData(script)),
                    new XElement(rob + "arguments",
                        arguments.Select(argument =>
                            new XElement(rob + "LuaValue",
                                new XElement(rob + "type", argument.Type),
                                new XElement(rob + "value", argument.Value)))))));
    }

    private static XDocument BuildCloseJob(string soapNamespace, string jobId)
    {
        XNamespace rob = soapNamespace;
        return Envelope(soapNamespace,
            new XElement(rob + "CloseJob",
                new XElement(rob + "jobID", jobId)));
    }

    private static async Task<string> PostSoapAsync(Uri endpoint, XDocument envelope, CancellationToken cancellationToken)
    {
        using var content = new StringContent(envelope.ToString(SaveOptions.DisableFormatting), Encoding.UTF8, "text/xml");
        using var response = await Client.PostAsync(endpoint, content, cancellationToken);
        var xml = await response.Content.ReadAsStringAsync(cancellationToken);
        response.EnsureSuccessStatusCode();
        return xml;
    }

    private static string ReadImageResult(string responseXml)
    {
        var document = XDocument.Parse(responseXml);
        var fault = document.Descendants().FirstOrDefault(element => element.Name.LocalName == "Fault");
        if (fault != null)
            throw new InvalidOperationException("RCCService SOAP fault: " + fault.Value);

        var luaValue = document.Descendants().FirstOrDefault(element => element.Name.LocalName == "LuaValue");
        var result = luaValue?.Elements().FirstOrDefault(element => element.Name.LocalName == "value")?.Value;
        result ??= document.Descendants().FirstOrDefault(element => element.Name.LocalName == "OpenJobResult")?
            .Descendants().FirstOrDefault(element => element.Name.LocalName == "value")?.Value;

        if (string.IsNullOrWhiteSpace(result))
            throw new InvalidOperationException("RCCService returned no thumbnail data.");

        try
        {
            return Convert.ToBase64String(Convert.FromBase64String(result));
        }
        catch (FormatException)
        {
            throw new InvalidOperationException("RCCService returned thumbnail data that was not valid base64.");
        }
    }

    private sealed record LuaValue(string Type, string Value)
    {
        public static LuaValue String(string value) => new("LUA_TSTRING", value);
        public static LuaValue Number(int value) => new("LUA_TNUMBER", value.ToString(System.Globalization.CultureInfo.InvariantCulture));
    }
}
