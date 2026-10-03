import { notFound } from 'next/navigation';
import { getTemplateById } from '@/lib/db';
import TemplateDesignerEditor from '@/components/TemplateDesignerEditor';

export const revalidate = 0;

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplateById(id);

  if (!template) {
    notFound();
  }

  return <TemplateDesignerEditor initialTemplate={template} />;
}
