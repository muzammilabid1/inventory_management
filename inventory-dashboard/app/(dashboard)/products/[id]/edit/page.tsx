import Link from "next/link";
import ProductForm from "@/components/ProductForm";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  console.log("Editing product:", id);

  return (
    <>
      <header className="flex h-20 items-center border-b border-zinc-800/80 pl-[72px] pr-6 md:px-6 lg:px-10">
        <div>
          <p className="text-sm font-medium text-zinc-300">
            Products
          </p>

          <p className="mt-0.5 text-xs text-zinc-600">
            Edit product
          </p>
        </div>
      </header>
      <div className="px-6 py-10 lg:px-10 lg:py-12">
        <Link
          href={`/products/${id}`}
          className="text-sm font-medium text-zinc-500 transition-colors duration-200 hover:text-emerald-400"
        >
          ← Back to product
        </Link>
        <div className="mt-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">
            Inventory
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Edit Product
          </h1>
          <p className="mt-5 text-base leading-7 text-zinc-400">
            Update the information, pricing, stock, or status of
            this product.
          </p>
        </div>
        <div className="mt-10 max-w-4xl">
          <ProductForm productId={id} />
        </div>
      </div>
    </>
  );
}
