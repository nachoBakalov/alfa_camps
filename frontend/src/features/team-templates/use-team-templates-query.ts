import { useQuery } from '@tanstack/react-query';
import {
  getTeamTemplates,
  getTeamTemplatesByCampType,
} from '../../api/team-templates.api';

export const teamTemplatesQueryKey = ['team-templates'] as const;

export function getTeamTemplatesQueryKey(campTypeId?: string) {
  return [...teamTemplatesQueryKey, campTypeId ?? 'all'] as const;
}

export function useTeamTemplatesQuery(campTypeId?: string) {
  return useQuery({
    queryKey: getTeamTemplatesQueryKey(campTypeId),
    queryFn: () => {
      if (campTypeId) {
        return getTeamTemplatesByCampType(campTypeId);
      }

      return getTeamTemplates();
    },
  });
}
