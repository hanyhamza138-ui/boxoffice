import Sidebar from "../components/Sidebar";

export default function AdminLayout({ children }) {

  return (
    <div
      style={{
        display:"flex",
        minHeight:"100vh",
        background:"#0b0b0b",
      }}
    >

      <Sidebar />


      <main
        style={{
          flex:1,
          padding:30,
        }}
      >
        {children}
      </main>


    </div>
  );
}