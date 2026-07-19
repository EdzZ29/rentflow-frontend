import UserManager from './UserManager';

export default function AdminOwners() {
  return (
    <UserManager
      role="owner"
      title="Owners"
      subtitle="Manage business owners and their subscription plans."
      showPlan
    />
  );
}
