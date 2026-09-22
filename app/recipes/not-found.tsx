import Link from "next/link";

export default function RecipeNotFound() {
  return (
    <div className="app-shell">
      <div className="empty-state" style={{ paddingTop: "6rem" }}>
        <h2>That recipe isn&apos;t here</h2>
        <p>It may have been deleted, or the link is off by a digit.</p>
        <Link href="/" className="btn btn-secondary">Back to all recipes</Link>
      </div>
    </div>
  );
}
