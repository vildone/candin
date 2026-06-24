/// <reference path="../pb_data/types.d.ts" />
// Candin — users koleksiyonuna oyunlaştırma alanlarını ekler.
// PocketBase v0.23+ API'si.

migrate((app) => {
  const collection = app.findCollectionByNameOrId("users")

  collection.fields.add(new NumberField({
    name: "xp",
    min: 0,
    onlyInt: true,
  }))

  collection.fields.add(new NumberField({
    name: "streak",
    min: 0,
    onlyInt: true,
  }))

  collection.fields.add(new TextField({
    name: "last_active_date",
    max: 10,
  }))

  collection.fields.add(new JSONField({
    name: "completed_lessons",
    maxSize: 200000,
  }))

  collection.fields.add(new JSONField({
    name: "unlocked_units",
    maxSize: 50000,
  }))

  collection.fields.add(new JSONField({
    name: "badges",
    maxSize: 50000,
  }))

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users")

  for (const fieldName of [
    "xp",
    "streak",
    "last_active_date",
    "completed_lessons",
    "unlocked_units",
    "badges",
  ]) {
    const field = collection.fields.getByName(fieldName)
    if (field) collection.fields.removeById(field.id)
  }

  app.save(collection)
})
