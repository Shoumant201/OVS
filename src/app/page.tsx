import Image from "next/image";
import DashboardPage from "./Dashboard/page"

export const metadata = {
  title: "Election Management System",
  description: "Manage your elections with ease",
}

export default function Home() {
  return (
    <div>
      <DashboardPage/>
    </div>
  );
}
