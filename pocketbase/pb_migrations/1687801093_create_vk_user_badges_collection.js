/// <reference path="../pb_data/types.d.ts" />

/**
 * @param {PocketBase} pb
 */
migrate(
  (app) => {
    const bearerRule = `@request.headers.authorization = 'Bearer ${process.env.POCKETBASE_BEARER_TOKEN}'`;
    const vkUsersCollection = app.findCollectionByNameOrId("vk_users");
    const badgesCollection = app.findCollectionByNameOrId("badges");

    const collection = new Collection({
      id: "vk_user_badges_collection",
      name: "vk_user_badges",
      type: "base",
      system: false,
      fields: [
        {
          cascadeDelete: false,
          collectionId: "badges_collection",
          hidden: false,
          id: "relation4277159965",
          maxSelect: 1,
          minSelect: 0,
          name: "badge",
          presentable: false,
          required: false,
          system: false,
          type: "relation",
        },
        {
          cascadeDelete: false,
          collectionId: "vk_users_collection",
          hidden: false,
          id: "user_relation4277159965",
          maxSelect: 1,
          minSelect: 0,
          name: "user",
          presentable: false,
          required: true,
          system: false,
          type: "relation",
        },
        {
          id: "earned_at",
          name: "earned_at",
          type: "date",
          system: false,
          required: true,
          presentable: false,
          unique: false,
          options: {
            min: "",
            max: "",
          },
        },
        {
          id: "progress_data",
          name: "progress_data",
          type: "json",
          system: false,
          required: false,
          presentable: false,
          unique: false,
          options: {
            maxSize: 2000000,
          },
        },
        {
          id: "notes",
          name: "notes",
          type: "text",
          system: false,
          required: false,
          presentable: false,
          unique: false,
          options: {
            min: null,
            max: 500,
            pattern: "",
          },
        },
      ],
      indexes: [
        // "CREATE UNIQUE INDEX `idx_vk_user_badges_unique` ON `vk_user_badges` (`vk_user`, `badge`)",
        // "CREATE INDEX `idx_vk_user_badges_user` ON `vk_user_badges` (`vk_user`)",
        // "CREATE INDEX `idx_vk_user_badges_badge` ON `vk_user_badges` (`badge`)",
        "CREATE INDEX `idx_vk_user_badges_earned` ON `vk_user_badges` (`earned_at`)",
      ],
      listRule: bearerRule,
      viewRule: bearerRule,
      createRule: bearerRule,
      updateRule: bearerRule,
      deleteRule: bearerRule,
      options: {},
    });

    return app.save(collection);
  },
  (pb) => {
    // Rollback function - удаляем коллекцию
    const collection = pb.findCollectionByNameOrId("vk_user_badges");
    if (collection) {
      return pb.delete(collection);
    }
  }
);
