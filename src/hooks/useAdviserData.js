import { useServiceQuery } from './useServiceQuery.js';
import { useCurrentAdviser } from './useCurrentUser.js';
import { listWorkflows } from '../services/workflowService.js';

/** Workflows for the current adviser's assigned clients. */
export function useAdviserWorkflows({ includeCompleted = true } = {}) {
  const adviser = useCurrentAdviser();
  const adviserId = adviser.data?.id;
  const workflows = useServiceQuery(() => (adviserId ? listWorkflows({ adviserId, includeCompleted }) : []), [adviserId, includeCompleted], { dependsOn: adviser });
  return { adviser, adviserId, workflows };
}
