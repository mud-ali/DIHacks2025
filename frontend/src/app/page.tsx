import Image from "next/image";
import darulIslah from "@/assets/darulislah.jpg";
import minhaj from "@/assets/minhaj.jpg";

export default function Home() {
  return (
    <div className="min-h-screen py-10">
      <h1 className="text-masjid-green text-3xl text-center">Masjid.Online</h1>
      <p className="block text-white text-center mt-20 w-1/3 mx-auto">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae pariatur
        neque
      </p>

      <a
        className="block bg-masjid-green w-30 mx-auto text-white p-4 text-center my-6 font-extrabold"
        href="/create"
      >
        Get Started
      </a>

      <div className="grid grid-cols-2 gap-4 w-2/3 mx-auto my-10">
        <Image
          src={darulIslah}
          alt="Mosque view 1"
          className="h-full w-11/12 object-cover rounded"
        />
        <Image
          src={minhaj}
          alt="Mosque view 2"
          className="h-full w-11/12 object-cover rounded"
        />
        <Image
          src={minhaj}
          alt="Mosque view 2"
          className="h-full w-11/12 object-cover rounded"
        />
        <Image
          src={darulIslah}
          alt="Mosque view 1"
          className="h-full w-11/12 object-cover rounded"
        />
      </div>
    </div>
  );
}
