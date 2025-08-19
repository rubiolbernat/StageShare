ALTER TABLE `stage_share`.`gdtf_channels`
DROP COLUMN `name`;

ALTER TABLE `stage_share`.`gdtf_channels`
ADD COLUMN `geometry` VARCHAR(100) AFTER `attribute`;
