import { PackageOpen } from "lucide-react"

export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <PackageOpen size={38} strokeWidth={1.5} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  )
}
