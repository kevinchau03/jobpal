import { cookies } from "next/headers";

type Contact = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
}

const statusColors = {
  default: "bg-gray-100 text-gray-700"
};

export default async function ContactsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

  const res = await fetch("http://localhost:4000/api/contacts?limit=20", {
    headers: { cookie: cookieHeader },
    cache: "no-store", 
  });
  
  if (!res.ok) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Contacts</h1>
        <p>Manage your contacts here.</p>
      </div>
    );
  }

  const { items: contacts } = (await res.json()) as { items: Contact[]; nextCursor: string | null };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>
      <p>Manage your contacts here.</p>
      <div className="mt-6 space-y-4">
        {contacts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No contacts found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map(contact => (
              <div 
                key={contact.id} 
                className="bg-white rounded-sm shadow-sm p-2 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-gray-900">{contact.name}</p>
                    {contact.email && <p className="text-sm text-gray-600">Email: {contact.email}</p>}
                    {contact.phone && <p className="text-sm text-gray-600">Phone: {contact.phone}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

}