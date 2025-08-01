export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center text-sm text-gray-600 p-4 mt-12">
      &copy; {new Date().getFullYear()} Scheduly. All rights reserved.
    </footer>
  );
}