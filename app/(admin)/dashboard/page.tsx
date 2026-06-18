export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-serif text-primary mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2">Total Bookings</h3>
          <p className="text-4xl font-serif text-gray-900">12</p>
        </div>
        <div className="bg-white p-6 rounded shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2">Total Revenue</h3>
          <p className="text-4xl font-serif text-gray-900">$24,500</p>
        </div>
        <div className="bg-white p-6 rounded shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2">Available Rooms</h3>
          <p className="text-4xl font-serif text-gray-900">3</p>
        </div>
      </div>
    </div>
  );
}
