import { createFileRoute } from "@tanstack/react-router";
import { AssociationDetailContent } from "@/components/my-space/association-detail";

export const Route = createFileRoute("/my-space/associations_/$id")({
  component: () => {
    const { id } = Route.useParams();
    return <AssociationDetailContent id={id} />;
  },
});
