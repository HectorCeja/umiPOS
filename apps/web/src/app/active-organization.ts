'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api-client';

const api = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
const organizationKey = 'nexo.active-organization';
const branchKey = 'nexo.active-branch';

export interface ActiveOrganization {
  id: string;
  name: string;
  status: string;
  role?: string;
  accessScope?: string;
}

export interface ActiveBranch {
  id: string;
  name: string;
  status: string;
}

export interface ActiveContext {
  loading: boolean;
  organization: ActiveOrganization | null;
  organizations: ActiveOrganization[];
  branch: ActiveBranch | null;
  branches: ActiveBranch[];
  selectOrganization: (id: string) => void;
  selectBranch: (id: string) => void;
}

export async function resolveActiveOrganization() {
  const response = await apiFetch(`${api}/v1/organizations`, { cache: 'no-store' });
  if (!response.ok) return { organizations: [] as ActiveOrganization[], organization: null };
  const payload: unknown = await response.json();
  const candidates: unknown[] = Array.isArray(payload) ? (payload as unknown[]) : [];
  const organizations = candidates.filter(
    (value): value is ActiveOrganization =>
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      'name' in value &&
      'status' in value &&
      value.status === 'ACTIVE',
  );
  const stored = localStorage.getItem(organizationKey);
  const organization =
    organizations.find((value) => value.id === stored) ?? organizations[0] ?? null;
  if (organization) localStorage.setItem(organizationKey, organization.id);
  return { organizations, organization };
}

export function useActiveOrganization(): ActiveContext {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<ActiveOrganization[]>([]);
  const [organization, setOrganization] = useState<ActiveOrganization | null>(null);
  const [branches, setBranches] = useState<ActiveBranch[]>([]);
  const [branch, setBranch] = useState<ActiveBranch | null>(null);

  const selectOrganization = useCallback((id: string) => {
    localStorage.setItem(organizationKey, id);
    localStorage.removeItem(branchKey);
    window.dispatchEvent(new CustomEvent('nexo:organization-changed', { detail: id }));
    window.location.assign('/');
  }, []);
  const selectBranch = useCallback(
    (id: string) => {
      localStorage.setItem(branchKey, id);
      setBranch(branches.find((value) => value.id === id) ?? null);
      window.dispatchEvent(new CustomEvent('nexo:branch-changed', { detail: id }));
    },
    [branches],
  );

  useEffect(() => {
    void (async () => {
      try {
        const resolved = await resolveActiveOrganization();
        const available = resolved.organizations;
        setOrganizations(available);
        const selected = resolved.organization;
        if (!selected) return;
        localStorage.setItem(organizationKey, selected.id);
        setOrganization(selected);
        const branchResponse = await apiFetch(`${api}/v1/organizations/${selected.id}/branches`, {
          cache: 'no-store',
        });
        if (branchResponse.ok) {
          const availableBranches = ((await branchResponse.json()) as ActiveBranch[]).filter(
            (value) => value.status === 'ACTIVE',
          );
          setBranches(availableBranches);
          const storedBranch = localStorage.getItem(branchKey);
          const selectedBranch =
            availableBranches.find((value) => value.id === storedBranch) ??
            availableBranches[0] ??
            null;
          if (selectedBranch) localStorage.setItem(branchKey, selectedBranch.id);
          setBranch(selectedBranch);
        }
      } catch {
        // The authenticated shell owns the visible dependency failure state.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return {
    loading,
    organization,
    organizations,
    branch,
    branches,
    selectOrganization,
    selectBranch,
  };
}

export function requireActiveContext(context: ActiveContext) {
  return context.organization && context.branch
    ? { organizationId: context.organization.id, branchId: context.branch.id }
    : null;
}
