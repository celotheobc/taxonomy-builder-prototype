import { ContextModelIcon, ObjectTypeIcon, ProcessFlowIcon } from '../../../components/icons/ContextModelIcons';

export function StudioTabIcon({ kind, size = 14 }) {
  return <ContextModelIcon kind={kind} size={size} />;
}

export function SectionIcon({ kind, size = 14 }) {
  return <ContextModelIcon kind={kind} size={size} />;
}

export { ObjectTypeIcon, ProcessFlowIcon };
