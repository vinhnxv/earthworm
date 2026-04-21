import fs from "node:fs";
import path from "node:path";

import { sql } from "drizzle-orm";

import { db } from "@earthworm/db";
import {
  coursePack,
  course as courseSchema,
  statement as statementSchema,
} from "@earthworm/schema";

type SeedStatement = {
  chinese?: string;
  vietnamese?: string;
  english: string;
  soundmark: string;
};

const courseVariant = process.env.COURSE_VARIANT === "zh" ? "zh" : "vi";
const courseConfig =
  courseVariant === "vi"
    ? {
        dataDir: "../data/courses-vi",
        title: "Xingrong Basic English",
        description: "Beginner-friendly English lessons with Vietnamese prompts.",
        cover: "/course-packs/xingrong-basic-english.svg",
        createLessonTitle: createEnglishLessonTitle,
      }
    : {
        dataDir: "../data/courses",
        title: "星荣零基础学英语",
        description: "最适合零基础入门的课程",
        cover:
          "https://earthworm-prod-1312884695.cos.ap-beijing.myqcloud.com/course-packs/xingrong.jpg",
        createLessonTitle: convertToChineseNumber,
      };
const coursesDir = path.resolve(__dirname, courseConfig.dataDir);

if (!fs.existsSync(coursesDir)) {
  throw new Error(`Course data directory not found: ${coursesDir}`);
}

const courses = fs.readdirSync(coursesDir);

(async function () {
  await db.execute(
    sql`TRUNCATE TABLE courses, statements, "course_packs", "user_course_progress", "course_history", "user_learn_record", "memberships" RESTART IDENTITY CASCADE;`,
  );

  const [coursePackEntity] = await db
    .insert(coursePack)
    .values({
      order: 1,
      title: courseConfig.title,
      description: courseConfig.description,
      creatorId: "1",
      shareLevel: "public",
      isFree: true,
      cover: courseConfig.cover,
    })
    .returning();

  const courseList = await Promise.all(
    courses.map(async (courseFileName, index) => {
      const courseName = path.parse(courseFileName).name;
      const [course] = await db
        .insert(courseSchema)
        .values({
          coursePackId: coursePackEntity.id,
          // Index starts from 0
          order: index + 1,
          title: courseConfig.createLessonTitle(courseName),
        })
        .returning({ id: courseSchema.id, order: courseSchema.order, title: courseSchema.title });

      console.log(`创建: id-${course.id} order-${course.order} title-${course.title}`);

      return {
        ...course,
        meta: {
          courseFileName,
          courseName,
        },
      };
    }),
  );

  await Promise.all(
    courseList.map(async (course) => {
      const { id: courseId, meta } = course;

      const courseDataJsonText = fs.readFileSync(
        path.resolve(coursesDir, meta.courseFileName),
        "utf-8",
      );

      const statementList = JSON.parse(courseDataJsonText) as SeedStatement[];

      let order = 1;
      const statementInsertTask = statementList.map(async (statement) => {
        return await db.insert(statementSchema).values({
          english: statement.english,
          soundmark: statement.soundmark,
          vietnamese: statement.vietnamese ?? statement.chinese ?? "",
          order: order++,
          courseId,
        });
      });

      console.log(`courseName: ${meta.courseFileName} 开始上传`);
      await Promise.all(statementInsertTask);
      console.log(`courseName: ${meta.courseFileName} 全部上传成功`);
    }),
  );

  console.log("全部创建完成");
  process.exit(0);
})();

function createEnglishLessonTitle(numStr: string): string {
  return `Lesson ${parseInt(numStr, 10)}`;
}

function convertToChineseNumber(numStr: string): string {
  const chineseNumbers = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  let chineseStr = "第";
  if (parseInt(numStr) >= 10) {
    const [tens, ones] = numStr.split("");
    if (tens !== "1") {
      chineseStr += chineseNumbers[parseInt(tens, 10)];
    }
    chineseStr += "十";
    if (ones !== "0") {
      chineseStr += chineseNumbers[parseInt(ones, 10)];
    }
  } else {
    chineseStr += chineseNumbers[parseInt(numStr, 10)];
  }
  chineseStr += "课";
  return chineseStr;
}
