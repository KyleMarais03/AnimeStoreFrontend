import { productCatalog } from "../data/productCatalog"
import { normalize, resolveImage, safeArray } from "./helpers"

const categoryNameOf = product => {
  if (typeof product?.category === "string") return product.category
  return product?.category?.name || product?.categoryName || ""
}

export const categoryCoverImage = (categoryName, products = []) => {
  const categoryKey = normalize(categoryName)
  const matching = safeArray(products).filter(product => normalize(categoryNameOf(product)) === categoryKey)
  const first = matching.find(product => Number(product?.stock ?? 0) > 0) || matching[0]

  if (first) return resolveImage(first)

  const fromCatalog = productCatalog.find(item => normalize(item.category) === categoryKey)
  return fromCatalog?.imagePath || "/products/brand-logo.png"
}
