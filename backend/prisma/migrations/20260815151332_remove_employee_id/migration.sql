/*
  Warnings:

  - You are about to drop the column `employeeId` on the `teacher` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Teacher_employeeId_key` ON `teacher`;

-- AlterTable
ALTER TABLE `teacher` DROP COLUMN `employeeId`;
