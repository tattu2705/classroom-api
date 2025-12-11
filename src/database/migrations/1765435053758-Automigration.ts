import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1765435053758 implements MigrationInterface {
    name = 'Automigration1765435053758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`teacher\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_00634394dce7677d531749ed8e\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`student\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`isSuspended\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_a56c051c91dbe1068ad683f536\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`teacher_student\` (\`teacherId\` int NOT NULL, \`studentId\` int NOT NULL, PRIMARY KEY (\`teacherId\`, \`studentId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`teacher_student\` ADD CONSTRAINT \`FK_038c1d8047679fefd41b6bffa28\` FOREIGN KEY (\`teacherId\`) REFERENCES \`teacher\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teacher_student\` ADD CONSTRAINT \`FK_2c4afeff8a893f2ae6396d65004\` FOREIGN KEY (\`studentId\`) REFERENCES \`student\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teacher_student\` DROP FOREIGN KEY \`FK_2c4afeff8a893f2ae6396d65004\``);
        await queryRunner.query(`ALTER TABLE \`teacher_student\` DROP FOREIGN KEY \`FK_038c1d8047679fefd41b6bffa28\``);
        await queryRunner.query(`DROP TABLE \`teacher_student\``);
        await queryRunner.query(`DROP INDEX \`IDX_a56c051c91dbe1068ad683f536\` ON \`student\``);
        await queryRunner.query(`DROP TABLE \`student\``);
        await queryRunner.query(`DROP INDEX \`IDX_00634394dce7677d531749ed8e\` ON \`teacher\``);
        await queryRunner.query(`DROP TABLE \`teacher\``);
    }

}
