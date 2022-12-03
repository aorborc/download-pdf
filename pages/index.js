import Head from "next/head";
import Image from "next/image";

export default function Home() {
  const generatePdf = async () => {
    const res = await fetch("/api/generatePdf?url=https://aorborc.com", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET", // You probably can use get aswell, you can use a post request with a custom body to generate dynamic data in your pdf view, I am going to cover that in a different post :)
    });
    return res.json();
  };
  return (  
    <div className="">
      <h1>Hello</h1>

      <main>
        <button type="button" onClick={generatePdf}>
          Create PDF
        </button>
      </main>
    </div>
  );
}
