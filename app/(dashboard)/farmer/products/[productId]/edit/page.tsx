import { EditProduct } from '@/components/features/farmer/edit-product';

export default async function EditFarmerProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  return <EditProduct productId={productId} />;
}
