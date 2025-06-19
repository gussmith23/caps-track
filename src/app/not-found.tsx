import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container">
      <p>
        {" "}
        Couldn't find the requested resource. <Link href="/">Return home.</Link>
      </p>
    </div>
  );
}
