-- AlterTable
ALTER TABLE `Dish` MODIFY `image` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Restaurant` MODIFY `picture` TEXT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL;
