import { Link } from "react-router-dom";
import { EmptyState } from "../components/ui";

export default function NotFoundPage() {
  return (
    <EmptyState icon="🧭" title="Page not found">
      <Link to="/" className="font-semibold text-amber-300 hover:underline">
        Back to the feed
      </Link>
    </EmptyState>
  );
}
