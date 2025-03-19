import Image from "next/image";
import Page from "./Dashboard/page"
import Login from "./pages/login/login";

export default function Home() {
  return (
    <div>
      {/* <Page/> */}
      <Login/>
    </div>
  );
}
