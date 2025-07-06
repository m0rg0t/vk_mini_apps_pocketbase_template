/**
 * @param {PocketBase} pb
 */
migrate(
  (app) => {
    console.log("Creating vk_users collection...");
    console.log("Using Bearer token:", process.env.POCKETBASE_BEARER_TOKEN);
    console.log("Using PocketBase URL:", JSON.stringify(process.env));

    const bearerRule = `@request.headers.authorization = 'Bearer ${process.env.POCKETBASE_BEARER_TOKEN}'`;
    // Проверяем, существует ли коллекция
    // const existingCollection = app.findCollectionByNameOrId("vk_users");
    // if (existingCollection) {
    //   return; // уже создана
    // }

    const collection = new Collection({
      id: "vk_users_collection",
      name: "vk_users",
      type: "base",
      system: false,
      fields: [
        // vk_id
        {
          id: "vk_id",
          name: "vk_id",
          type: "number",
          system: false,
          required: true,
          presentable: true,
          unique: true,
          options: { min: null, max: null, noDecimal: true },
        },
        // first_name
        {
          id: "first_name",
          name: "first_name",
          type: "text",
          system: false,
          required: false,
          presentable: false,
          unique: false,
          options: { min: null, max: null, pattern: "" },
        },
        // last_name
        {
          id: "last_name",
          name: "last_name",
          type: "text",
          system: false,
          required: false,
          presentable: false,
          unique: false,
          options: { min: null, max: null, pattern: "" },
        },
        // photo_url
        {
          id: "photo_url",
          name: "photo_url",
          type: "url",
          system: false,
          required: false,
          presentable: false,
          unique: false,
          options: { exceptDomains: null, onlyDomains: null },
        },
        // last_activity
        {
          id: "last_activity",
          name: "last_activity",
          type: "date",
          system: false,
          required: false,
          presentable: false,
          unique: false,
          options: { min: "", max: "" },
        },
        // telegram_user_id
        {
          id: "telegram_user_id",
          name: "telegram_user_id",
          type: "number",
          system: false,
          required: false,
          presentable: false,
          unique: false,
          options: { min: null, max: null, noDecimal: true },
        },
        {
          id: "vk_user_created_date",
          name: "created",
          type: "autodate",
          system: false,
          required: false,
          presentable: false,
          unique: false,
          hidden: false,
          onCreate: true,
          onUpdate: false,
        },
        {
          id: "vk_user_updated_date",
          name: "updated",
          type: "autodate",
          system: false,
          required: false,
          presentable: false,
          unique: false,
          hidden: false,
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [
        "CREATE UNIQUE INDEX `idx_vk_users_vk_id` ON `vk_users` (`vk_id`)",
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
  (app) => {
    // Rollback function - удаляем коллекцию
    const collection = app.findCollectionByNameOrId("vk_users");
    if (collection) {
      return app.delete(collection);
    }
  }
);
