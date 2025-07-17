/**
 * @param {PocketBase} pb
 */
migrate(
  (app) => {
    console.log("Creating user_data collection...");

    const bearerRule = `@request.headers.authorization = 'Bearer ${process.env.POCKETBASE_BEARER_TOKEN}'`;

    const collection = new Collection({
      id: "user_data_collection",
      name: "user_data",
      type: "base",
      system: false,
      fields: [
        // user - relation to vk_users
        {
          id: "user_field",
          name: "user",
          type: "relation",
          system: false,
          required: true,
          presentable: false,
          unique: false,
          cascadeDelete: true,
          collectionId: "vk_users_collection",
          maxSelect: 1,
          minSelect: 0
        },
        // data_type - what type of data this is (settings, preferences, etc.)
        {
          id: "data_type_field",
          name: "data_type",
          type: "text",
          system: false,
          required: true,
          presentable: false,
          unique: false,
          options: { min: null, max: null, pattern: "" }
        },
        // data_key - key for the data entry
        {
          id: "data_key_field",
          name: "data_key",
          type: "text",
          system: false,
          required: true,
          presentable: false,
          unique: false,
          options: { min: null, max: null, pattern: "" }
        },
        // data_value - JSON value of the data
        {
          id: "data_value_field",
          name: "data_value",
          type: "json",
          system: false,
          required: false,
          presentable: false,
          unique: false,
          options: { maxSize: 2000000 }
        },
        // created date
        {
          id: "user_data_created_date",
          name: "created",
          type: "autodate",
          system: false,
          required: false,
          presentable: false,
          unique: false,
          hidden: false,
          onCreate: true,
          onUpdate: false
        },
        // updated date
        {
          id: "user_data_updated_date",
          name: "updated",
          type: "autodate",
          system: false,
          required: false,
          presentable: false,
          unique: false,
          hidden: false,
          onCreate: true,
          onUpdate: true
        }
      ],
      indexes: [
        "CREATE INDEX `idx_user_data_user` ON `user_data` (`user`)",
        "CREATE INDEX `idx_user_data_type` ON `user_data` (`data_type`)",
        "CREATE UNIQUE INDEX `idx_user_data_unique` ON `user_data` (`user`, `data_type`, `data_key`)"
      ],
      listRule: bearerRule,
      viewRule: bearerRule,
      createRule: bearerRule,
      updateRule: bearerRule,
      deleteRule: bearerRule,
      options: {}
    });

    return app.save(collection);
  },
  (app) => {
    // Rollback function - delete the collection
    const collection = app.findCollectionByNameOrId("user_data");
    if (collection) {
      return app.delete(collection);
    }
  }
);