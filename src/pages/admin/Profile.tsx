import ProfileSection from '../../sections/profile/ProfileSection';
import type { UserProfile } from '../../lib/db';

interface ProfileProps {
  currentUser: UserProfile;
  avatarUrl: string;
  onAvatarChange: (url: string) => void;
}

export default function Profile({ currentUser, avatarUrl, onAvatarChange }: ProfileProps) {
  return (
    <ProfileSection
      currentUser={currentUser}
      avatarUrl={avatarUrl}
      onAvatarChange={onAvatarChange}
    />
  );
}
