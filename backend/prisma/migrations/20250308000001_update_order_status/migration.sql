-- AlterEnum: Update OrderStatus enum
CREATE TYPE "OrderStatus_new" AS ENUM ('pending', 'searching_pharmacy', 'confirmed', 'driver_assigned', 'on_the_way', 'delivered', 'cancelled');

ALTER TABLE "Order" ADD COLUMN "status_new" "OrderStatus_new";

UPDATE "Order" SET "status_new" = 
  CASE "status"::text
    WHEN 'pending' THEN 'pending'::"OrderStatus_new"
    WHEN 'confirmed' THEN 'confirmed'::"OrderStatus_new"
    WHEN 'preparing' THEN 'confirmed'::"OrderStatus_new"
    WHEN 'out_for_delivery' THEN 'on_the_way'::"OrderStatus_new"
    WHEN 'delivered' THEN 'delivered'::"OrderStatus_new"
    WHEN 'cancelled' THEN 'cancelled'::"OrderStatus_new"
    ELSE 'pending'::"OrderStatus_new"
  END;

ALTER TABLE "Order" DROP COLUMN "status";
ALTER TABLE "Order" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "Order" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'pending'::"OrderStatus_new";

DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
