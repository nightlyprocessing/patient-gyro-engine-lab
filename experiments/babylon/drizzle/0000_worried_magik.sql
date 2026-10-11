CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`slot` integer NOT NULL,
	`token` text NOT NULL,
	`x` real NOT NULL,
	`z` real NOT NULL,
	`yaw` real NOT NULL,
	`heartbeat` integer NOT NULL,
	`last_input` integer NOT NULL,
	`seq` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `room_slot` ON `players` (`room`,`slot`);--> statement-breakpoint
CREATE UNIQUE INDEX `player_token` ON `players` (`token`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`created` integer NOT NULL,
	`hatch` integer DEFAULT 1 NOT NULL,
	`grill` integer DEFAULT 1 NOT NULL,
	`served` integer DEFAULT 0 NOT NULL,
	`message` text DEFAULT 'Welcome to the night shift.' NOT NULL,
	`message_at` integer DEFAULT 0 NOT NULL
);
