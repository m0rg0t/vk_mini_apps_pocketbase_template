import express from "express";
import pbFetch from "../utils/pbFetch.js";
import { POCKETBASE_URL } from "../config.js";
import { checkEarnedBadges, awardEarnedBadges } from "../utils/badgeChecker.js";
import { verifyVkSignature, verifyUserAccess } from "../utils/signature.js";
import { checkReadBadges, awardReferralBadge } from "../utils/badgeAwarder.js";
import {
  validateUserId,
  validateBookId,
  validateId,
  validateBookData,
  handleValidationErrors,
  createSafeFilter
} from "../utils/validation.js";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
  Image, // добавлен импорт Imageк
} from "@react-pdf/renderer";
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Roboto" },
  section: { marginBottom: 10 },
  title: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "bold",
    fontFamily: "Roboto",
  },
  description: { fontSize: 12, marginBottom: 4, fontFamily: "Roboto" },
  rating: { fontSize: 12, marginBottom: 4, fontFamily: "Roboto" },
  review: {
    fontSize: 12,
    marginBottom: 8,
    // fontStyle: "italic",
    fontFamily: "Roboto",
    whiteSpace: "pre-wrap",
  },
});

const router = express.Router();

// Get user's books
router.get("/:userId/books", validateUserId(), handleValidationErrors, verifyVkSignature, verifyUserAccess, async (req, res) => {
  try {
    const safeFilter = createSafeFilter('user', req.params.userId);
    const response = await pbFetch(
      `${POCKETBASE_URL}/api/collections/vk_user_books/records?filter=(${safeFilter})&expand=book_id&sort=-created`
    );

    console.info("Fetching user books from PocketBase:", response.url);

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to get user books" });
    }

    return res.json(data);
  } catch (e) {
    console.error("PocketBase get user books error:", e);
    return res.status(500).json({
      error: "Failed to get user books"
    });
  }
});

// Generate PDF list of user's books (POST method for better security)
router.get("/:userId/books/pdf", async (req, res) => {
  try {
    const response = await pbFetch(
      `${POCKETBASE_URL}/api/collections/vk_user_books/records?filter=(user="${req.params.userId}")&expand=book_id&sort=-finished_reading`
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    const items = data.items || [];
    // Генерируем QR-код для мини-приложения
    const miniAppUrl = `https://vk.com/app${process.env.VK_APP_ID || '53603553'}`;
    const qrDataUrl = await QRCode.toDataURL(miniAppUrl, { width: 200 });
    
    // Загружаем изображение A4.png как base64
    const imagePath = path.join(process.cwd(), 'assets', 'A4.png');
    let imageBase64 = '';
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
      console.warn('Could not load A4.png image:', error.message);
    }
    // Add some logging for debugging
    console.log(
      `Generating PDF for user ${req.params.userId} with ${items.length} books`
    );

    // Handle empty case
    if (items.length === 0) {
      console.log("No books found for user, creating empty PDF");
    }
    // Log book details for debugging
    items.forEach((item, index) => {
      const book = item.expand?.book_id || {};
      console.log(
        `Book ${index + 1}: ${book.title || "Unknown"} (ID: ${item.id})`
      );
      console.log(`  Description length: ${book.description?.length || 0}`);
      console.log(`  Rating: ${item.rating || "none"}`);
      console.log(`  Review length: ${item.review?.length || 0}`);
    });

    // Sanitize text to prevent PDF generation issues
    // Удаляет только опасные управляющие символы, emoji и keycap не трогает
    const sanitizeText = (text) => {
      if (!text) return "";
      // Удаляем только реально управляющие символы (кроме \n, \r, \t)
      // Emoji, keycap и спецсимволы не трогаем
      return text.replace(/[\u0000-\u0008\u000B\u000E-\u001F\u007F-\u009F]/g, "").trim();
    };

    // Helper function to create text paragraphs from multiline text
    const createTextParagraphs = (text, style, keyPrefix = 'paragraph') => {
      if (!text) return [];
      return text.split('\n').filter(paragraph => paragraph.trim()).map((paragraph, index) =>
        React.createElement(
          Text,
          { key: `${keyPrefix}-${index}`, style },
          paragraph.trim()
        )
      );
    }; // Create a simple, robust PDF document with Cyrillic support
    const doc = React.createElement(
      Document,
      null,
      // Первая страница с картинкой A4.png (только если изображение загружено)
      ...(imageBase64 ? [React.createElement(
        Page,
        { size: "A4" },
        React.createElement(Image, {
          src: imageBase64,
          style: { width: "100%", height: "100%" },
        })
      )] : []),
      // Вторая страница и далее со списком книг
      React.createElement(
        Page,
        { size: "A4", style: styles.page },
        React.createElement(
          Text,
          {
            style: {
              fontSize: 20,
              marginBottom: 20,
              textAlign: "center",
              fontFamily: "Roboto",
            },
          },
          "Моя библиотека"
        ),
        items.length === 0
          ? React.createElement(
              Text,
              {
                style: {
                  fontSize: 14,
                  textAlign: "center",
                  marginTop: 50,
                  fontFamily: "Roboto",
                },
              },
              "В вашей библиотеке нет книг."
            )
          : items.map((item, index) => {
              const book = item.expand?.book_id || {};
              const title = sanitizeText(book.title) || "Без названия";
              const author = sanitizeText(book.author) || "Автор неизвестен";
              const description = sanitizeText(book.description);
              const review = sanitizeText(item.review);
              const finishedReading = item.finished_reading
                ? new Date(item.finished_reading).toLocaleDateString("ru-RU", { year: 'numeric', month: 'long', day: 'numeric' })
                : null;
              return React.createElement(
                View,
                { key: `book-${index}`, style: styles.section },
                book.cover
                  ? React.createElement(Image, {
                      src: book.cover,
                      style: { width: 80, height: 120, marginBottom: 8 },
                    })
                  : null,
                  React.createElement(Text, { style: styles.rating }, author),
                  React.createElement(Text, { style: styles.title }, title),
                description
                  ? React.createElement(
                      View,
                      null,
                      ...createTextParagraphs(description, styles.description, `description-${index}`)
                    )
                  : null,
                finishedReading
                  ? React.createElement(
                      Text,
                      { style: styles.rating },
                      `Дата прочтения: ${finishedReading}`
                    )
                  : null,
                item.rating != null && item.rating !== 0
                  ? React.createElement(
                      Text,
                      { style: styles.rating },
                      `Оценка: ${item.rating}/5`
                    )
                  : null,
                review
                  ? React.createElement(
                      View,
                      null,
                      React.createElement(
                        Text,
                        { style: styles.review },
                        "Отзыв:"
                      ),
                      ...createTextParagraphs(review, styles.review, `review-${index}`)
                    )
                  : null
              );
            }),
        // QR-код в конце документа
        React.createElement(
          View,
          { style: { marginTop: 20, alignItems: 'center' } },
          React.createElement(Image, {
            src: qrDataUrl,
            style: { width: 50, height: 50 },
          }),
          React.createElement(
            Text,
            {
              style: {
                fontSize: 10,
                textAlign: 'center',
                marginTop: 5,
                fontFamily: 'Roboto',
              },
            },
            'Присоединяйтесь к нашему книжному челленджу!'
          )
        )
      )
    );
    console.log("Creating PDF from React document...");
    console.log("Document structure created, attempting PDF generation...");

    let pdfBuffer;
    try {
      const stream = await renderToBuffer(doc);
      pdfBuffer = stream; // await pdf(doc).toBuffer();
    } catch (pdfError) {
      console.error("PDF creation failed:", pdfError.message);
      console.error("PDF error details:", pdfError);
      // Try creating a minimal test document to see if the issue is with our structure

      return res
        .status(500)
        .json({ error: "Failed to create PDF", details: pdfError.message });
    }
    console.log(
      "PDF buffer created successfully, size:",
      pdfBuffer?.length || 0
    );

    // Additional validation to ensure we have a proper buffer
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      console.error("PDF generation failed: Invalid buffer generated");
      return res.status(500).json({
        error: "Failed to generate PDF",
        details: "Invalid PDF buffer generated",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="books_${req.params.userId}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (e) {
    console.log("Generate PDF error:", e);
    // Avoid circular reference issues by only sending the error message
    const errorMessage =
      e?.message || "Unknown error occurred during PDF generation";
    return res
      .status(500)
      .json({ error: "Failed to generate PDF", details: errorMessage });
  }
});

// Add book to user's library
router.post("/:userId/books", verifyVkSignature, async (req, res) => {
  try {
    // Проверяем наличие book_id в запросе
    if (!req.body.book_id) {
      return res.status(400).json({ error: "book_id is required" });
    }

    // Проверяем, не добавлена ли уже эта книга пользователем
    const userFilter = createSafeFilter('user', req.params.userId);
    const bookFilter = createSafeFilter('book_id', req.body.book_id);
    const combinedFilter = `(${userFilter} && ${bookFilter})`;
    
    const existingResponse = await pbFetch(
      `${POCKETBASE_URL}/api/collections/vk_user_books/records?filter=${encodeURIComponent(combinedFilter)}`
    );
    const existingData = await existingResponse.json();

    if (existingData.items && existingData.items.length > 0) {
      return res.status(409).json({ 
        error: "Book already exists in user's library",
        existing_record: existingData.items[0]
      });
    }

    const bookData = {
      user: req.params.userId,
      ...req.body,
    };

    const response = await pbFetch(
      `${POCKETBASE_URL}/api/collections/vk_user_books/records`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Check and award read badges if book was added as completed
    if (req.body.status === "completed") {
      console.log(`[BOOK COMPLETION] Book added as completed for user ${req.params.userId}, triggering badge check`);
      try {
        const badgesAwarded = await checkReadBadges(req.params.userId);
        console.log(
          `[BOOK COMPLETION] ✅ Badge check completed for user ${req.params.userId}: ${badgesAwarded} badges awarded`
        );
        console.log(
          `Checked read badges for user ${req.params.userId}, awarded ${badgesAwarded} badges`
        );
      } catch (badgeError) {
        console.log(`[BOOK COMPLETION] ❌ Badge check failed for user ${req.params.userId}:`, badgeError.message);
        console.log("Error checking read badges:", badgeError);
        // Don't fail the book addition if badge check fails
      }
    } else {
      console.log(`[BOOK COMPLETION] Book added with status "${req.body.status}" for user ${req.params.userId}, no badge check needed`);
    }

    return res.status(201).json(data);
  } catch (e) {
    console.log("PocketBase add user book error:", e);
    return res.status(500).json({
      error: "Failed to add book to user library",
      details: e.message,
    });
  }
});

// Add or update book in user's library
router.post("/:userId/books/:bookId", validateUserId(), validateBookId(), validateBookData(), handleValidationErrors, verifyVkSignature, verifyUserAccess, async (req, res) => {
  try {
    const { userId, bookId } = req.params;
    const userFilter = createSafeFilter('user', userId);
    const bookFilter = createSafeFilter('book_id', bookId);
    const combinedFilter = `(${userFilter} && ${bookFilter})`;
    
    // Проверяем, существует ли уже запись для этого пользователя и книги
    const upsertResponse = await pbFetch(
      `${POCKETBASE_URL}/api/collections/vk_user_books/records?filter=${encodeURIComponent(combinedFilter)}`
    );
    const upsertData = await upsertResponse.json();

    let data;
    let wasCompleted = false;

    if (upsertData.items && upsertData.items.length > 0) {
      const recordId = upsertData.items[0].id;
      const updatePayload = { status: req.body.status };
      if (req.body.status === "completed" && !req.body.finished_reading) {
        updatePayload.finished_reading = new Date().toISOString();
      }
      if (req.body.started_reading)
        updatePayload.started_reading = req.body.started_reading;
      if (req.body.finished_reading)
        updatePayload.finished_reading = req.body.finished_reading;
      if (req.body.rating) updatePayload.rating = req.body.rating;
      if (req.body.review) updatePayload.review = req.body.review;

      const response = await pbFetch(
        `${POCKETBASE_URL}/api/collections/vk_user_books/records/${recordId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        }
      );
      data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);

      wasCompleted = req.body.status === "completed";
    } else {
      const now = new Date().toISOString();
      const createPayload = {
        user: userId,
        book_id: bookId,
        status: req.body.status,
        started_reading: req.body.started_reading || now,
      };
      if (req.body.status === "completed") {
        createPayload.finished_reading = req.body.finished_reading || now;
        wasCompleted = true;
      }
      if (req.body.rating) createPayload.rating = req.body.rating;
      if (req.body.review) createPayload.review = req.body.review;

      const response = await pbFetch(
        `${POCKETBASE_URL}/api/collections/vk_user_books/records`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createPayload),
        }
      );
      data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
    }

    // Check and award read badges if book was marked as completed
    if (wasCompleted) {
      console.log(`[BOOK COMPLETION] Book upserted as completed for user ${userId}, triggering badge check`);
      try {
        const badgesAwarded = await checkReadBadges(userId);
        console.log(
          `[BOOK COMPLETION] ✅ Badge check completed for user ${userId}: ${badgesAwarded} badges awarded`
        );
        console.log(
          `Checked read badges for user ${userId}, awarded ${badgesAwarded} badges`
        );
      } catch (badgeError) {
        console.log(`[BOOK COMPLETION] ❌ Badge check failed for user ${userId}:`, badgeError.message);
        console.log("Error checking read badges:", badgeError);
        // Don't fail the book update if badge check fails
      }
    } else {
      console.log(`[BOOK COMPLETION] Book upserted with status "${req.body.status}" for user ${userId}, no badge check needed`);
    }

    return res.json(data);
  } catch (e) {
    console.error("PocketBase upsert user book error:", e);
    return res
      .status(500)
      .json({ error: "Failed to upsert user book" });
  }
});

// Update user's book status/rating
router.put(
  "/:userId/books/:userBookId",
  validateUserId(),
  validateId('userBookId'),
  validateBookData(),
  handleValidationErrors,
  verifyVkSignature,
  verifyUserAccess,
  async (req, res) => {
    try {
      const response = await pbFetch(
        `${POCKETBASE_URL}/api/collections/vk_user_books/records/${req.params.userBookId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      // Check and award read badges if book was marked as completed
      if (req.body.status === "completed") {
        try {
          const badgesAwarded = await checkReadBadges(req.params.userId);
          console.log(
            `[BOOK COMPLETION] ✅ Badge check completed for user ${req.params.userId}: ${badgesAwarded} badges awarded`
          );
          console.log(
            `Checked read badges for user ${req.params.userId}, awarded ${badgesAwarded} badges`
          );
        } catch (badgeError) {
          console.log(`[BOOK COMPLETION] ❌ Badge check failed for user ${req.params.userId}:`, badgeError.message);
          console.log("Error checking read badges:", badgeError);
          // Don't fail the book update if badge check fails
        }
      } else {
        console.log(`[BOOK COMPLETION] Book updated with status "${req.body.status || 'no status change'}" for user ${req.params.userId}, no badge check needed`);
      }

      return res.json(data);
    } catch (e) {
      console.error("PocketBase update user book error:", e);
      return res.status(500).json({
        error: "Failed to update user book"
      });
    }
  }
);

// Delete book from user's library
router.delete(
  "/:userId/books/:userBookId",
  validateUserId(),
  validateId('userBookId'),
  handleValidationErrors,
  verifyVkSignature,
  verifyUserAccess,
  async (req, res) => {
    try {
      const response = await pbFetch(
        `${POCKETBASE_URL}/api/collections/vk_user_books/records/${req.params.userBookId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }

      return res.status(204).send();
    } catch (e) {
      console.log("PocketBase delete user book error:", e);
      return res.status(500).json({
        error: "Failed to delete user book",
        details: e.message,
      });
    }
  }
);

// Get user's badges
// router.get("/:userId/badges", verifyVkSignature, verifyUserAccess, async (req, res) => {
router.get("/:userId/badges", async (req, res) => {
  try {
    console.log(`[USER BADGES] Fetching badges for user ${req.params.userId}`);
    const url = `${POCKETBASE_URL}/api/collections/vk_user_badges/records?filter=(user="${req.params.userId}")&expand=badge&sort=-earned_at`;
    console.log(`[USER BADGES] Request URL: ${url}`);

    const response = await pbFetch(url);

    const data = await response.json();

    console.log(`[USER BADGES] Response status: ${response.status}`);
    console.log(`[USER BADGES] Response data:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.log(`[USER BADGES] Error response for user ${req.params.userId}`);
      return res.status(response.status).json(data);
    }

    console.log(`[USER BADGES] Successfully fetched badges for user ${req.params.userId}`);
    return res.json(data);
  } catch (e) {
    console.log("PocketBase get user badges error:", e);
    return res.status(500).json({
      error: "Failed to get user badges",
      details: e.message,
    });
  }
});

// Award badge to user
router.post("/:userId/badges", verifyVkSignature, verifyUserAccess, async (req, res) => {
  try {
    // Check if a specific badge ID is provided
    if (req.body.badge_id) {
      // Manual badge awarding - existing logic
      const existingResponse = await pbFetch(
        `${POCKETBASE_URL}/api/collections/vk_user_badges/records?filter=(user="${req.params.userId}" && badge_id="${req.body.badge_id}")`
      );
      const existingData = await existingResponse.json();

      if (existingData.items && existingData.items.length > 0) {
        return res.status(409).json({ error: "User already has this badge" });
      }

      const badgeData = {
        user: req.params.userId,
        earned_at: new Date().toISOString(),
        ...req.body,
      };
      const response = await pbFetch(
        `${POCKETBASE_URL}/api/collections/vk_user_badges/records`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(badgeData),
        }
      );
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      return res.status(201).json(data);
    } else {
      // Auto badge checking and awarding - check for earned badges based on criteria
      console.log(`Checking earned badges for user ${req.params.userId}`);

      const result = await awardEarnedBadges(req.params.userId);

      if (result.success && result.badgesAwarded.length > 0) {
        return res.status(201).json({
          message: result.message,
          badgesAwarded: result.badgesAwarded.map((item) => ({
            badge: item.badge,
            userBadge: item.result,
          })),
        });
      } else if (result.success) {
        return res.status(200).json({
          message: result.message,
          badgesAwarded: [],
        });
      } else {
        return res.status(207).json({
          message: result.message,
          badgesAwarded: result.badgesAwarded.map((item) => ({
            badge: item.badge,
            userBadge: item.result,
          })),
          errors: result.errors,
        });
      }
    }
  } catch (e) {
    console.log("PocketBase award badge error:", e);
    return res
      .status(500)
      .json({ error: "Failed to award badge", details: e.message });
  }
});

// Check which badges user has earned but not yet received
router.get("/:userId/badges/check", verifyVkSignature, verifyUserAccess, async (req, res) => {
  try {
    console.log(`Checking earned badges for user ${req.params.userId}`);

    const result = await checkEarnedBadges(req.params.userId);

    return res.json({
      user: result.user,
      earnedBadges: result.earnedBadges,
      totalEarned: result.totalEarned,
      message:
        result.totalEarned > 0
          ? `User has earned ${result.totalEarned} new badge(s)`
          : "No new badges earned",
    });
  } catch (e) {
    console.log("PocketBase check badges error:", e);
    return res
      .status(500)
      .json({ error: "Failed to check badges", details: e.message });
  }
});

// Award referral badge for inviting friends
router.post("/:userId/award-referral-badge", verifyVkSignature, verifyUserAccess, async (req, res) => {
  try {
    console.log(`[REFERRAL BADGE ENDPOINT] Request to award referral badge for user ${req.params.userId}`);
    
    const badgeAwarded = await awardReferralBadge(req.params.userId);
    
    if (badgeAwarded) {
      console.log(`[REFERRAL BADGE ENDPOINT] ✅ Referral badge successfully awarded to user ${req.params.userId}`);
      return res.json({
        success: true,
        badgeAwarded: true,
        message: "Бейдж за приглашение друга успешно выдан!"
      });
    } else {
      console.log(`[REFERRAL BADGE ENDPOINT] ⚠️ Referral badge not awarded to user ${req.params.userId} (likely already exists)`);
      return res.json({
        success: true,
        badgeAwarded: false,
        message: "Бейдж уже был выдан ранее"
      });
    }
  } catch (e) {
    console.log(`[REFERRAL BADGE ENDPOINT] ❌ Error awarding referral badge to user ${req.params.userId}:`, e.message);
    return res.status(500).json({
      success: false,
      badgeAwarded: false,
      error: "Failed to award referral badge",
      details: e.message,
    });
  }
});

// Get personalized recommendations for user
router.get("/:userId/recommendations", verifyVkSignature, verifyUserAccess, async (req, res) => {
  try {
    const userBooksResponse = await pbFetch(
      `${POCKETBASE_URL}/api/collections/vk_user_books/records?filter=(user="${req.params.userId}")&expand=book_id`
    );
    const userBooksData = await userBooksResponse.json();

    let excludeFilter = "";
    if (userBooksData.items && userBooksData.items.length > 0) {
      const readBookIds = userBooksData.items
        .map((item) => `"${item.book_id}"`)
        .join(",");
      excludeFilter = `&filter=(id!~[${readBookIds}])`;
    }

    const response = await pbFetch(
      `${POCKETBASE_URL}/api/collections/books/records?sort=@random&perPage=20${excludeFilter}`
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    const recommendations = {
      user_id: req.params.userId,
      type: "personalized",
      books: data.items || [],
      generated_at: new Date().toISOString(),
      total_books_read: userBooksData.items ? userBooksData.items.length : 0,
    };

    return res.json(recommendations);
  } catch (e) {
    console.log("PocketBase get user recommendations error:", e);
    return res.status(500).json({
      error: "Failed to get personalized recommendations",
      details: e.message,
    });
  }
});

export default router;
