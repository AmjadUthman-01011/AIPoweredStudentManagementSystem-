/*
  Warnings:

  - You are about to drop the column `studentCode` on the `student` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Student_studentCode_key` ON `student`;

-- AlterTable
ALTER TABLE `student` DROP COLUMN `studentCode`;
