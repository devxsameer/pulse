import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/links')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/links"!</div>
}
