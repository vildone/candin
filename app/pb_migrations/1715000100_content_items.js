/// <reference path="../pb_data/types.d.ts" />
// Candin — content_items: tüm modül içeriği (dini_bilgiler, elifba, namaz,
// sureler, peygamberler) tek koleksiyonda. Bir kayıt = bir ünite/ders/harf.

migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "content_items",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
  })

  collection.fields.add(new TextField({
    name: "module",
    required: true,
    max: 64,
  }))

  collection.fields.add(new TextField({
    name: "item_id",
    required: true,
    max: 128,
  }))

  collection.fields.add(new NumberField({
    name: "order_index",
    min: 0,
    onlyInt: true,
  }))

  collection.fields.add(new JSONField({
    name: "data",
    required: true,
    maxSize: 2000000,
  }))

  collection.addIndex("idx_content_module", false, "module", "")
  collection.addIndex("idx_content_module_item", true, "module, item_id", "")

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("content_items")
  app.delete(collection)
})
