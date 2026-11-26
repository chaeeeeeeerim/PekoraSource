using System;
using System.Reflection;
using Xunit;

namespace Roblox.Rendering.Test;

public sealed class RccSoapRendererTests
{
    private static readonly Type RendererType =
        typeof(RenderingHandler).Assembly.GetType("Roblox.Rendering.RccSoapRenderer", throwOnError: true)!;

    [Theory]
    [InlineData("Hat")]
    [InlineData("Mesh")]
    [InlineData("MeshPart")]
    [InlineData("Model")]
    [InlineData("Image")]
    [InlineData("Head")]
    [InlineData("Emote")]
    public void SupportsBundledCatalogThumbnailTypes(string type)
    {
        var method = RendererType.GetMethod("Supports", BindingFlags.Public | BindingFlags.Static)!;
        Assert.True((bool)method.Invoke(null, new object[] { type })!);
    }

    [Theory]
    [InlineData("Avatar")]
    [InlineData("Avatar3D")]
    [InlineData("Place")]
    [InlineData("Animation")]
    [InlineData("Unknown")]
    public void DoesNotClaimUnsupportedRenderTypes(string type)
    {
        var method = RendererType.GetMethod("Supports", BindingFlags.Public | BindingFlags.Static)!;
        Assert.False((bool)method.Invoke(null, new object[] { type })!);
    }

    [Fact]
    public void RejectsPublicSoapEndpoints()
    {
        var previous = Environment.GetEnvironmentVariable("RCC_SOAP_ENDPOINT");
        try
        {
            Environment.SetEnvironmentVariable("RCC_SOAP_ENDPOINT", "https://rcc.example.com/soap");
            var method = RendererType.GetMethod("GetPrivateEndpoint", BindingFlags.NonPublic | BindingFlags.Static)!;
            var exception = Assert.Throws<TargetInvocationException>(() => method.Invoke(null, null));
            Assert.IsType<InvalidOperationException>(exception.InnerException);
        }
        finally
        {
            Environment.SetEnvironmentVariable("RCC_SOAP_ENDPOINT", previous);
        }
    }

    [Fact]
    public void AcceptsLoopbackSoapEndpoint()
    {
        var previous = Environment.GetEnvironmentVariable("RCC_SOAP_ENDPOINT");
        try
        {
            Environment.SetEnvironmentVariable("RCC_SOAP_ENDPOINT", "http://127.0.0.1:64989");
            var method = RendererType.GetMethod("GetPrivateEndpoint", BindingFlags.NonPublic | BindingFlags.Static)!;
            var endpoint = (Uri)method.Invoke(null, null)!;
            Assert.Equal("127.0.0.1", endpoint.Host);
            Assert.Equal(64989, endpoint.Port);
        }
        finally
        {
            Environment.SetEnvironmentVariable("RCC_SOAP_ENDPOINT", previous);
        }
    }
}
