import HelpSection from '../../sections/help/HelpSection';
import type { UserProfile } from '../../lib/db';

interface HelpProps {
  currentUser: UserProfile;
}

export default function Help({ currentUser }: HelpProps) {
  return <HelpSection role={currentUser.role} />;
}
