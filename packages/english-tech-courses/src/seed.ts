import fs from "node:fs";
import path from "node:path";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@earthworm/db";
import {
  courseHistory as courseHistorySchema,
  coursePack as coursePackSchema,
  course as courseSchema,
  statement as statementSchema,
  userCourseProgress as userCourseProgressSchema,
} from "@earthworm/schema";

type SeedStatement = {
  vietnamese?: string;
  chinese?: string;
  english: string;
  soundmark: string;
};

const creatorId = "1";
const shouldReset = process.env.ENGLISH_TECH_RESET === "1";
const coursePackConfig = {
  dataDir: "../data/courses-vi",
  title: "English Tech",
  description: "Curated English lessons for software teams, synthesized from multiple sources.",
  cover: "/course-packs/english-tech.svg",
  createLessonTitle: createEnglishTechLessonTitle,
};

const coursesDir = path.resolve(__dirname, coursePackConfig.dataDir);

if (!fs.existsSync(coursesDir)) {
  throw new Error(`Course data directory not found: ${coursesDir}`);
}

(async function () {
  if (shouldReset) {
    await db.execute(
      sql`TRUNCATE TABLE courses, statements, "course_packs", "user_course_progress", "course_history", "user_learn_record", "memberships" RESTART IDENTITY CASCADE;`,
    );
  }

  await replaceCoursePack();

  console.log("English Tech 全部创建完成");
  process.exit(0);
})();

async function replaceCoursePack() {
  await db.transaction(async (tx) => {
    const existingCoursePack = await tx.query.coursePack.findFirst({
      where: and(
        eq(coursePackSchema.title, coursePackConfig.title),
        eq(coursePackSchema.creatorId, creatorId),
      ),
      with: {
        courses: true,
      },
    });

    const coursePackOrder = existingCoursePack
      ? existingCoursePack.order
      : ((
          await tx.query.coursePack.findFirst({
            orderBy: (table, { desc }) => [desc(table.order)],
            where: (table, { eq }) => eq(table.creatorId, creatorId),
          })
        )?.order ?? 0) + 1;

    if (existingCoursePack) {
      await Promise.all(
        existingCoursePack.courses.map((course) =>
          tx.delete(statementSchema).where(eq(statementSchema.courseId, course.id)),
        ),
      );
      await tx
        .delete(userCourseProgressSchema)
        .where(eq(userCourseProgressSchema.coursePackId, existingCoursePack.id));
      await tx
        .delete(courseHistorySchema)
        .where(eq(courseHistorySchema.coursePackId, existingCoursePack.id));
      await tx.delete(courseSchema).where(eq(courseSchema.coursePackId, existingCoursePack.id));
      await tx.delete(coursePackSchema).where(eq(coursePackSchema.id, existingCoursePack.id));
    }

    const [coursePackEntity] = await tx
      .insert(coursePackSchema)
      .values({
        order: coursePackOrder,
        title: coursePackConfig.title,
        description: coursePackConfig.description,
        cover: coursePackConfig.cover,
        creatorId,
        shareLevel: "public",
        isFree: true,
      })
      .returning();

    const courseFileNames = fs
      .readdirSync(coursesDir)
      .filter((fileName) => fileName.endsWith(".json"))
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

    for (const [index, courseFileName] of courseFileNames.entries()) {
      const courseName = path.parse(courseFileName).name;
      const [courseEntity] = await tx
        .insert(courseSchema)
        .values({
          coursePackId: coursePackEntity.id,
          order: index + 1,
          title: coursePackConfig.createLessonTitle(courseName),
        })
        .returning({
          id: courseSchema.id,
          order: courseSchema.order,
          title: courseSchema.title,
        });

      console.log(
        `课程包: ${coursePackConfig.title} 创建课程 id-${courseEntity.id} order-${courseEntity.order} title-${courseEntity.title}`,
      );

      const statementList = JSON.parse(
        fs.readFileSync(path.resolve(coursesDir, courseFileName), "utf-8"),
      ) as SeedStatement[];

      let statementOrder = 1;
      for (const statement of statementList) {
        await tx.insert(statementSchema).values({
          english: statement.english,
          soundmark: statement.soundmark,
          vietnamese: statement.vietnamese ?? statement.chinese ?? "",
          order: statementOrder++,
          courseId: courseEntity.id,
        });
      }

      console.log(`课程包: ${coursePackConfig.title} courseName: ${courseFileName} 全部上传成功`);
    }
  });
}

function createEnglishTechLessonTitle(numStr: string): string {
  const lessonTitleMap: Record<string, string> = {
    "01": "Implementing Code",
    "02": "Code Review & Testing",
    "03": "Discussing Code",
    "04": "Bug Fixing",
    "05": "Collaboration & Meetings",
  };

  return lessonTitleMap[numStr] ?? `Unit ${parseInt(numStr, 10)}`;
}
