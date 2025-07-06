/// <reference path="../pb_data/types.d.ts" />

/**
 * @param {PocketBase} pb
 */
migrate((app) => {
  const bearerRule = `@request.headers.authorization = 'Bearer ${process.env.POCKETBASE_BEARER_TOKEN}'`;
  const collection = new Collection({
    id: "badges_collection",
    name: "badges",
    type: "base",
    system: false,
    fields: [
      {
        id: "name",
        name: "name",
        type: "text",
        system: false,
        required: true,
        presentable: true,
        unique: true,
        options: {
          min: null,
          max: 100,
          pattern: ""
        }
      },
      {
        id: "description",
        name: "description",
        type: "text",
        system: false,
        required: true,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: 500,
          pattern: ""
        }
      },      {
        id: "image",
        name: "image",
        type: "file",
        system: false,
        required: false,
        presentable: false,
        unique: false,
        options: {
          maxSelect: 1,
          maxSize: 2097152,
          mimeTypes: [
            "image/jpeg",
            "image/png",
            "image/svg+xml",
            "image/gif",
            "image/webp"
          ],
          thumbs: [
            "50x50",
            "100x100",
            "200x200"
          ],
          protected: false
        }
      },
      {
        id: "imageUrl",
        name: "imageUrl",
        type: "text",
        system: false,
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: 500,
          pattern: ""
        }
      },
      {
        id: "criteria",
        name: "criteria",
        type: "text",
        system: false,
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: 1000,
          pattern: ""
        }
      },
      {
        id: "is_active",
        name: "is_active",
        type: "bool",
        system: false,
        required: false,
        presentable: false,
        unique: false,
        options: {}
      },
      {
        id: "sort_order",
        name: "sort_order",
        type: "number",
        system: false,
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: 0,
          max: null,
          noDecimal: true
        }
      }
    ],
    indexes: [
      "CREATE UNIQUE INDEX `idx_badges_name` ON `badges` (`name`)",
      "CREATE INDEX `idx_badges_active_sort` ON `badges` (`is_active`, `sort_order`)"
    ],
    listRule: bearerRule,
    viewRule: bearerRule,
    createRule: bearerRule,
    updateRule: bearerRule,
    deleteRule: bearerRule,
    options: {}
  });

  return app.save(collection);
}, (pb) => {
  // Rollback function - удаляем коллекцию
  const collection = pb.findCollectionByNameOrId("badges");
  if (collection) {
    return pb.delete(collection);
  }
});
