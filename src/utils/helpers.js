import { productCatalog } from "../data/productCatalog.js";

export const money = value => `R ${Number(value || 0).toFixed(2)}`

export const normalize = value => String(value || "").trim().toLowerCase()

export const safeArray = value => Array.isArray(value) ? value : []

export const uuid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`

const normalizedKey = value => normalize(value).replace(/[^a-z0-9]+/g, " ").trim()

const imageMimeFromBinary = binary => {
  if (binary.startsWith("RIFF") && binary.slice(8, 12) === "WEBP") return "image/webp"
  if (binary.startsWith("\x89PNG\r\n\x1a\n")) return "image/png"
  if (binary.startsWith("\xff\xd8\xff")) return "image/jpeg"
  if (binary.startsWith("GIF87a") || binary.startsWith("GIF89a")) return "image/gif"
  return "image/jpeg"
}

const binaryToDataUrl = binary => `data:${imageMimeFromBinary(binary)};base64,${btoa(binary)}`

export const productImage = product => {
  const image = product?.productImage
  if (!image) {
    const directImage = product?.imageUrl || product?.image
    return typeof directImage === "string" && (directImage.startsWith("/") || directImage.startsWith("http://") || directImage.startsWith("https://") || directImage.startsWith("data:")) ? directImage : ""
  }

  if (typeof image === "string") {
    if (image.startsWith("data:") || image.startsWith("http://") || image.startsWith("https://") || (image.startsWith("/") && !/^[A-Za-z0-9+/=]+$/.test(image))) return image
    try {
      const binary = atob(image)
      return binaryToDataUrl(binary)
    } catch {
      return ""
    }
  }

  if (Array.isArray(image)) {
    let binary = ""
    for (let index = 0; index < image.length; index += 1) binary += String.fromCharCode(image[index])
    return binaryToDataUrl(binary)
  }

  return ""
}

const productByName = new Map(productCatalog.map(item => [normalizedKey(item.name), item]))

const categoryImageGroups = productCatalog.reduce((groups, item) => {
  const category = normalizedKey(item.category)
  if (!groups[category]) groups[category] = []
  groups[category].push(item)
  return groups
}, {})

const imageRules = [
  [/\b(gear five|gear 5|luffy|one piece)\b.*\b(figure|collectible)\b|\b(figure|collectible)\b.*\b(luffy|one piece)\b/, "Monkey D. Luffy Gear Five Collectible Figure"],
  [/\b(kakashi)\b.*\b(keychain|pendant|necklace)\b/, "Kakashi Reading Chibi Keychain"],
  [/\b(naruto)\b.*\b(keychain)\b/, "Naruto Acrylic Character Keychain"],
  [/\b(demon slayer|tanjiro)\b.*\b(keychain|sword)\b/, "Demon Slayer Mini Sword Keychain"],
  [/\b(sharingan|akatsuki)\b.*\b(ring|necklace)\b/, "Akatsuki Red Cloud Ring"],
  [/\b(konoha|leaf village)\b.*\b(pendant|necklace)\b/, "Konoha Leaf Village Pendant"],
  [/\b(gojo)\b.*\b(backpack)\b/, "Jujutsu Kaisen Gojo Backpack"],
  [/\b(itachi)\b.*\b(backpack)\b/, "Itachi Akatsuki Backpack"],
  [/\b(naruto)\b.*\b(backpack)\b/, "Naruto Backpack"],
  [/\b(luffy|one piece)\b.*\b(backpack)\b/, "One Piece Luffy Backpack"],
  [/\b(tanjiro|demon slayer)\b.*\b(backpack)\b/, "Demon Slayer Tanjiro Backpack"],
  [/\b(attack on titan|survey corps)\b.*\b(backpack)\b/, "Attack on Titan Survey Corps Backpack"],
  [/\b(gojo)\b.*\b(waist bag|bag)\b/, "Gojo Purple Waist Bag"],
  [/\b(goku|dragon ball)\b.*\b(hoodie|sweatshirt)\b/, "Dragon Ball Z Goku Graphic Hoodie"],
  [/\b(gojo)\b.*\b(hoodie|sweatshirt|jumper)\b/, "Gojo Purple Graphic Hoodie"],
  [/\b(itachi|akatsuki)\b.*\b(hoodie|sweatshirt|jumper)\b/, "Itachi Akatsuki Graphic Hoodie"],
  [/\b(tanjiro|demon slayer)\b.*\b(hoodie|sweatshirt|jumper)\b/, "Demon Slayer Tanjiro Graphic Hoodie"],
  [/\b(luffy|one piece)\b.*\b(hoodie|sweatshirt|jumper)\b/, "Luffy Red Graphic Hoodie"],
  [/\b(barou)\b.*\b(tee|t shirt|shirt)\b/, "Blue Lock Barou Graphic T-Shirt"],
  [/\b(sukuna)\b.*\b(tee|t shirt|shirt)\b/, "Sukuna Graphic T-Shirt"],
  [/\b(straw hat|luffy|one piece)\b.*\b(tee|t shirt|shirt|jersey)\b/, "One Piece Straw Hat T-Shirt"],
  [/\b(naruto)\b.*\b(tee|t shirt|shirt)\b/, "Naruto Flame Graphic Hoodie"],
  [/\b(itachi)\b.*\b(jogger|pants|trouser)\b/, "Itachi Akatsuki Cargo Joggers"],
  [/\b(gaming headset|headphones|headset)\b/, "Demon Slayer Tanjiro Gaming Headset"],
  [/\b(keyboard)\b/, "Itachi RGB Mechanical Keyboard"],
  [/\b(mousepad|desk mat)\b/, "One Piece Luffy Gaming Mousepad"],
  [/\b(ps5|xbox|controller skin)\b/, "Naruto Xbox Controller Skin"],
  [/\b(nintendo switch|switch case|console case)\b/, "Pokémon Nintendo Switch Carrying Case"],
  [/\b(sneaker|footwear|high top|shoes)\b.*\b(naruto)\b|\b(naruto)\b.*\b(sneaker|footwear|high top|shoes)\b/, "Naruto High-Top Sneakers"],
  [/\b(sneaker|footwear|high top|shoes)\b.*\b(gojo|jujutsu)\b|\b(gojo|jujutsu)\b.*\b(sneaker|footwear|high top|shoes)\b/, "Jujutsu Kaisen Gojo High-Top Sneakers"],
  [/\b(sneaker|footwear|high top|shoes)\b.*\b(tanjiro|demon slayer)\b|\b(tanjiro|demon slayer)\b.*\b(sneaker|footwear|high top|shoes)\b/, "Demon Slayer Tanjiro Backpack"],
  [/\b(sneaker|footwear|high top|shoes)\b.*\b(luffy|one piece)\b|\b(luffy|one piece)\b.*\b(sneaker|footwear|high top|shoes)\b/, "One Piece Luffy High-Top Sneakers"],
  [/\b(sneaker|footwear|high top|shoes)\b.*\b(goku|dragon ball)\b|\b(goku|dragon ball)\b.*\b(sneaker|footwear|high top|shoes)\b/, "Dragon Ball Z Goku High-Top Sneakers"],
  [/\b(notebook|sketchbook|planner|sticky notes|pen set|stationery)\b.*\b(tanjiro|demon slayer)\b|\b(tanjiro|demon slayer)\b.*\b(notebook|sketchbook|planner|sticky notes|pen set|stationery)\b/, "Demon Slayer Tanjiro Notebook – Water Design"],
  [/\b(notebook|sketchbook|planner|sticky notes|pen set|stationery)\b.*\b(naruto)\b|\b(naruto)\b.*\b(notebook|sketchbook|planner|sticky notes|pen set|stationery)\b/, "Naruto Anime Notebook"],
  [/\b(neon|led strip|night light|lamp|light strip)\b/, "Akatsuki Cloud Neon Sign"],
  [/\b(tapestry|wall shelf|display shelf|wall decor)\b/, "Anime Floating Wall Shelves"],
  [/\b(poster|print|wall art)\b.*\b(attack on titan|titan)\b|\b(attack on titan|titan)\b.*\b(poster|print|wall art)\b/, "Attack on Titan Poster Print"],
  [/\b(poster|print|wall art)\b.*\b(naruto)\b|\b(naruto)\b.*\b(poster|print|wall art)\b/, "Naruto Rasengan Poster Print"],
  [/\b(figure|collectible|statue)\b.*\b(tanjiro|demon slayer)\b|\b(tanjiro|demon slayer)\b.*\b(figure|collectible|statue)\b/, "Demon Slayer Tanjiro Collectible Figure"],
  [/\b(figure|collectible|statue)\b.*\b(levi|attack on titan)\b|\b(levi|attack on titan)\b.*\b(figure|collectible|statue)\b/, "Attack on Titan Levi Ackerman Figure"],
  [/\b(figure|collectible|statue)\b.*\b(gojo|jujutsu)\b|\b(gojo|jujutsu)\b.*\b(figure|collectible|statue)\b/, "Gojo Cursed Energy Figure"],
  [/\b(figure|collectible|statue)\b.*\b(naruto)\b|\b(naruto)\b.*\b(figure|collectible|statue)\b/, "Naruto Rasengan Collectible Figure"],
  [/\b(figure|collectible|statue)\b.*\b(luffy|one piece)\b|\b(luffy|one piece)\b.*\b(figure|collectible|statue)\b/, "Monkey D. Luffy Gear Five Collectible Figure"],
]

export const fallbackProductImage = product => {
  const nameKey = normalizedKey(product?.name)
  const exact = productByName.get(nameKey)
  if (exact) return exact.imagePath

  const query = `${product?.name || ""} ${product?.category?.name || product?.categoryName || ""}`.toLowerCase()
  const rule = imageRules.find(([pattern]) => pattern.test(query))
  if (rule) {
    const target = productByName.get(normalizedKey(rule[1]))
    if (target) return target.imagePath
  }

  const category = normalizedKey(product?.category?.name || product?.categoryName || product?.category || "")
  const categoryItems = categoryImageGroups[category]
  if (categoryItems?.length) {
    const key = String(product?.productId || product?.name || category)
    const seed = [...key].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7)
    return categoryItems[seed % categoryItems.length].imagePath
  }

  return "/products/brand-logo.png"
}

const exactCatalogImage = product => {
  const item = productByName.get(normalizedKey(product?.name))
  return item?.imagePath || ""
}

export const resolveImage = product =>
    exactCatalogImage(product) || productImage(product) || fallbackProductImage(product)

export const statusClass = value => String(value || "").toLowerCase().replace(/\s+/g, "-")

export const productCategoryName = product =>
    product?.category?.name ||
    product?.categoryName ||
    (typeof product?.category === "string" ? product.category : "")

export const filterByCategory = (products, categoryName) =>
    !categoryName
        ? safeArray(products)
        : safeArray(products).filter(
            product => normalize(productCategoryName(product)) === normalize(categoryName)
        )

export const categoryCoverImage = (categoryName, products = []) => {
  const inCategory = filterByCategory(products, categoryName)
  const first = inCategory.find(product => Number(product.stock) > 0) || inCategory[0]
  if (first) return resolveImage(first)
  const fromCatalog = productCatalog.find(
      item => normalize(item.category) === normalize(categoryName)
  )
  return fromCatalog?.imagePath || "/products/brand-logo.png"
}