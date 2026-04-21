export function createStatement(courseId: string) {
  return {
    order: 1,
    vietnamese: "你好",
    english: "hi",
    soundmark: "/hi/",
    courseId,
  };
}

export function createMultipleStatement(courseId: string) {
  return [
    {
      order: 1,
      vietnamese: "我",
      english: "I",
      soundmark: "/aɪ/",
      courseId,
    },
    {
      order: 2,
      vietnamese: "喜欢",
      english: "like",
      soundmark: "/laɪk/",
      courseId,
    },
  ];
}
