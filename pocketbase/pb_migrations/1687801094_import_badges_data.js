/**
 * Импорт данных бейджей с структурированными критериями
 * 
 * Формат критериев:
 * - registration: регистрация пользователя
 * - read_X: прочтение X книг (например, read_1, read_10, read_50)
 * - referral_X: приглашение X друзей (например, referral_1)
 * - streak_X: чтение X дней подряд (например, streak_7, streak_30)
 * - goal_X: достижение X% годовой цели (например, goal_50, goal_100)
 * 
 * @param {PocketBase} pb
 */
migrate((app) => {
  // Данные бейджей для импорта с структурированными критериями
  const badges = [
    {
      name: "Открываю первую страницу",
      description: "Поздравляем, ты присоединился к нашему читательскому приключению! Получи первую звезду!",
      imageUrl: "/Badges-01.webp",
      criteria: "registration",
      is_active: true,
      sort_order: 1
    },
    {
      name: "Моя первая книга",
      description: "Прочитал первую книгу — получи новый бейдж!",
      imageUrl: "/Badges-02.webp",
      criteria: "read_1",
      is_active: true,
      sort_order: 2
    },
    {
      name: "Мастер: 10 книг",
      description: "Ты прочитал 10 книг — заработал звание Мастера чтения и новый бейдж!",
      imageUrl: "/Badges-04.webp",
      criteria: "read_10",
      is_active: true,
      sort_order: 3
    },
    {
      name: "Исследователь: 20 книг",
      description: "Ты прочитал 20 интересных историй и заработал четвертый бейдж.",
      imageUrl: "/Badges-03.webp",
      criteria: "read_20",
      is_active: true,
      sort_order: 4
    },
    {
      name: "Суперчитатель: 50 книг",
      description: "Ты достоин звания Суперчитателя, ведь ты прочитал 50 книг!",
      imageUrl: "/Badges-05.webp",
      criteria: "read_50",
      is_active: true,
      sort_order: 5
    },
    {
      name: "Книжный советчик",
      description: "Приведи друга в челлендж и получи звание Книжного советчика.",
      imageUrl: "/Badges-06.webp",
      criteria: "referral_1",
      is_active: true,
      sort_order: 6
    }
  ];

  // Получаем коллекцию badges
  const collection = app.findCollectionByNameOrId("badges");
  if (!collection) {
    throw new Error("Коллекция 'badges' не найдена. Убедитесь, что предыдущая миграция выполнена.");
  }
  
  // Создаем записи для каждого бейджа
  badges.forEach((badgeData) => {
    // Проверяем, существует ли уже бейдж с таким именем
    try {
      const existingRecord = app.findFirstRecordByData(collection, "name", badgeData.name);
      if (existingRecord) {
        console.log(`Бейдж '${badgeData.name}' уже существует. Пропускаем.`);
        return;
      }
    } catch (e) {
      // Если запись не найдена, продолжаем создание
    }

    // Создаем новую запись
    const record = new Record(collection, badgeData);
    app.save(record);
    console.log(`Создан бейдж: ${badgeData.name}`);
  });
}, (app) => {
  // Rollback функция - удалить созданные записи
  const collection = app.findCollectionByNameOrId("badges");
  if (collection) {
    // Имена созданных бейджей
    const badgeNames = [
      "Открываю первую страницу",
      "Моя первая книга",
      "Мастер: 10 книг",
      "Исследователь: 20 книг",
      "Суперчитатель: 50 книг",
      "Книжный советчик"
    ];
    
    // Удаляем каждый бейдж, если он существует
    badgeNames.forEach((name) => {
      try {
        const record = app.findFirstRecordByData(collection, "name", name);
        if (record) {
          app.delete(record);
          console.log(`Удален бейдж: ${name}`);
        }
      } catch (e) {
        // Запись не найдена или уже удалена
      }
    });
  }
});
