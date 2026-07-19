import UserManager from './UserManager';

export default function AdminClients() {
  return (
    <UserManager
      role="customer"
      title="Clients"
      subtitle="Manage customer accounts — activate, deactivate, or remove."
    />
  );
}
