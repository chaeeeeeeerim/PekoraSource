import { get as getStore, Readable, Writable, writable } from "svelte/store";
interface IRankResponse {
	rank: {
		name: string,
		details: {
			isAdmin: boolean,
			isModerator: boolean,
			isOwner: boolean,
		},
		permissions: string[];
	}
	restrictions: Record<string, boolean>;
}
const lsKey = 'v.1_adm_rank_data';
function readCachedRank(): IRankResponse | null {
	try {
		const raw = localStorage.getItem(lsKey);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		return parsed && parsed.rank && parsed.rank.details ? parsed : null;
	} catch {
		try { localStorage.removeItem(lsKey); } catch {}
		return null;
	}
}
const store: Writable<IRankResponse | null> = writable(readCachedRank());
store.subscribe(newRankData => {
	try {
		if (newRankData) localStorage.setItem(lsKey, JSON.stringify(newRankData));
		else localStorage.removeItem(lsKey);
	} catch {}
});

import request from '../lib/request';
const permissionsPromise = request.get<IRankResponse>('/permissions').then(data => {
	if (!data.data || !data.data.rank || !data.data.rank.details) {
		throw new Error('The backend returned an invalid admin-permissions response.');
	}
	console.log('[info] current perms', data.data);
	store.set(data.data);
}).catch(error => {
	store.set(null);
	throw error;
});

export const promise = permissionsPromise;

export default store as Readable<IRankResponse>

export const get = () => {
	return getStore(store).rank.name;
}

type RankTypes = 'Admin' | 'Moderator' | 'Owner' | 'Mod' | 'admin' | 'moderator' | 'owner' | 'mod';

export const is = (rank: RankTypes): boolean => {
	const data = getStore(store);
	if (data) {
		// details is basically inherited permissions
		// so if user is owner, they will always have owner, admin, and mod
		// etc...
		// so checks for "if (mod || admin || owner)" in the final if statement isn't required
		let d = data.rank.details;
		if (rank.toLowerCase() === 'owner') {
			return d.isOwner;
		}
		if (rank.toLowerCase() === 'admin') {
			return d.isAdmin;
		}
		if (rank.toLowerCase() === 'mod' || rank.toLowerCase() === 'moderator') {
			return d.isModerator;
		}
	}

	return false;
}

export const hasPermission = (permission: string) => {
	const data = getStore(store);
	if (data && data.rank) {
		return data.rank.permissions.includes(permission);
	}
	console.log('No data available') // should not be hit
	return false;
}