const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_pzKid3nuVGP2@ep-sparkling-union-b5betlay-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function main() {
  await client.connect();
  console.log('Connected to Neon PostgreSQL...');

  // 1. Ensure Operator & Admin Users
  await client.query(`
    UPDATE users SET role = 'ROLE_OPERATOR' WHERE email = 'operator@memento3d.vn';
  `);
  console.log('Updated operator@memento3d.vn to ROLE_OPERATOR');

  const operatorUserRes = await client.query(`SELECT id FROM users WHERE email = 'operator@memento3d.vn' LIMIT 1`);
  const operatorUserId = operatorUserRes.rows[0]?.id;

  async function insertLedger(tx) {
    await client.query(`
      INSERT INTO inventory_transactions (
        id, transaction_type, warehouse_id, material_id,
        delta_on_hand_gram, delta_reserved_gram,
        before_on_hand_gram, after_on_hand_gram,
        before_reserved_gram, after_reserved_gram,
        print_job_id, reference_id, idempotency_key, performed_by, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
    `, [
      tx.type, tx.warehouseId, tx.materialId,
      tx.deltaOnHand, tx.deltaReserved,
      tx.beforeOnHand, tx.afterOnHand,
      tx.beforeReserved, tx.afterReserved,
      tx.printJobId || null, tx.referenceId || null, tx.idempotencyKey || null,
      operatorUserId, tx.createdAt || new Date()
    ]);
  }

  // 2. Clear previous warehouse seed data
  console.log('Cleaning old warehouse flow data...');
  await client.query('DELETE FROM print_job_consumptions');
  await client.query('DELETE FROM stock_reservations');
  await client.query('DELETE FROM inventory_transactions');
  await client.query('DELETE FROM print_jobs');
  await client.query('DELETE FROM stock_issues');
  await client.query('DELETE FROM stock_receipts');
  await client.query('DELETE FROM inventory_balances');
  await client.query('DELETE FROM warehouse_memberships');
  await client.query('DELETE FROM materials');
  await client.query('DELETE FROM warehouses');

  // 3. Insert Materials
  console.log('Seeding materials catalog...');
  const materials = [
    {
      sku: 'PLA-WHT-001',
      name: 'eSun PLA+ Cold White 1.75mm',
      type: 'PLA',
      color: 'Cold White',
      hex: '#F8FAFC',
      density: 1.24,
      diameter: 1.75,
      tMin: 205, tMax: 225, bMin: 55, bMax: 65,
      cost: 320,
      desc: 'High tenacity, low shrinkage, premium cold white finish for consumer figurines and architectural models.'
    },
    {
      sku: 'PLA-BLK-002',
      name: 'Polymaker PolyLite PLA Galaxy Black 1.75mm',
      type: 'PLA',
      color: 'Galaxy Black',
      hex: '#111827',
      density: 1.25,
      diameter: 1.75,
      tMin: 210, tMax: 230, bMin: 60, bMax: 70,
      cost: 350,
      desc: 'Deep matte black with fine cosmic sparkles, hiding layer lines effectively.'
    },
    {
      sku: 'PETG-BLU-001',
      name: 'Bambu Lab PETG Basic Translucent Cyan',
      type: 'PETG',
      color: 'Translucent Cyan',
      hex: '#06B6D4',
      density: 1.27,
      diameter: 1.75,
      tMin: 230, tMax: 255, bMin: 70, bMax: 80,
      cost: 420,
      desc: 'Water-resistant, high impact resistance, crystalline translucent look.'
    },
    {
      sku: 'ABS-GRY-001',
      name: 'Sunlu ABS Industrial Tough Grey 1.75mm',
      type: 'ABS',
      color: 'Industrial Grey',
      hex: '#64748B',
      density: 1.05,
      diameter: 1.75,
      tMin: 240, tMax: 270, bMin: 90, bMax: 110,
      cost: 380,
      desc: 'Heat resistant up to 100°C, easily acetone smoothed for functional engineering prototypes.'
    },
    {
      sku: 'TPU-ORG-001',
      name: 'Overture High-Speed TPU 95A Neon Orange',
      type: 'TPU',
      color: 'Neon Orange',
      hex: '#F97316',
      density: 1.21,
      diameter: 1.75,
      tMin: 215, tMax: 235, bMin: 40, bMax: 60,
      cost: 580,
      desc: 'Shore 95A flexible elastomer with 450% elongation at break, ideal for phone cases and dampening pads.'
    },
    {
      sku: 'RESIN-SGY-001',
      name: 'Elegoo 8K Standard Precision Photopolymer Resin Space Grey',
      type: 'RESIN',
      color: 'Space Grey',
      hex: '#475569',
      density: 1.15,
      diameter: 0.00,
      tMin: 25, tMax: 30, bMin: 0, bMax: 0,
      cost: 750,
      desc: 'Ultra-high detail 22um LCD/DLP resin for intricate anime miniature figurines and jewelry master molds.'
    },
    {
      sku: 'PACF-BLK-001',
      name: 'Polymaker PolyMide PA6-CF Carbon Fiber Black',
      type: 'NYLON',
      color: 'Carbon Fiber Black',
      hex: '#1F2937',
      density: 1.17,
      diameter: 1.75,
      tMin: 280, tMax: 300, bMin: 80, bMax: 100,
      cost: 1250,
      desc: '20% carbon fiber reinforced nylon filament with extraordinary tensile strength and thermal resistance.'
    }
  ];

  const materialMap = {};
  for (const m of materials) {
    const res = await client.query(`
      INSERT INTO materials (
        id, sku, name, material_type, color, color_hex, density, diameter,
        print_temp_min, print_temp_max, bed_temp_min, bed_temp_max,
        unit_cost, status, description, created_by, version, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'ACTIVE', $13, $14, 0, NOW(), NOW()
      ) RETURNING id, sku, name, unit_cost
    `, [m.sku, m.name, m.type, m.color, m.hex, m.density, m.diameter, m.tMin, m.tMax, m.bMin, m.bMax, m.cost, m.desc, operatorUserId]);
    materialMap[m.sku] = res.rows[0];
  }

  // 4. Insert Warehouses
  console.log('Seeding warehouses...');
  const warehouses = [
    { code: 'WH-HCM-01', name: 'Kho Trung Tâm Tân Bình (TP.HCM)', location: 'Số 142 Cộng Hòa, Phường 12, Quận Tân Bình, TP.HCM' },
    { code: 'WH-HN-01', name: 'Kho Vận Miền Bắc Cầu Giấy (Hà Nội)', location: 'Số 88 Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội' },
    { code: 'WH-DN-01', name: 'Kho Trung Chuyển Miền Trung (Đà Nẵng)', location: 'Số 25 Nguyễn Văn Linh, Hải Châu, Đà Nẵng' },
    { code: 'WH-OCTO-LAB', name: 'Xưởng Sản Xuất 3D In Nhanh Lab 01', location: 'Tầng 3, Memento3D MakerSpace, Quận 7, TP.HCM' }
  ];

  const warehouseMap = {};
  for (const w of warehouses) {
    const res = await client.query(`
      INSERT INTO warehouses (
        id, code, name, location, status, created_by, version, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'ACTIVE', $4, 0, NOW(), NOW()
      ) RETURNING id, code, name
    `, [w.code, w.name, w.location, operatorUserId]);
    warehouseMap[w.code] = res.rows[0];
  }

  // 4b. Seed Warehouse Memberships (Access Control F01 & Scoping)
  console.log('Seeding warehouse memberships...');
  const memberRoles = [
    { wh: 'WH-HCM-01', role: 'MANAGER' },
    { wh: 'WH-HN-01', role: 'WAREHOUSE_STAFF' },
    { wh: 'WH-DN-01', role: 'WAREHOUSE_STAFF' },
    { wh: 'WH-OCTO-LAB', role: 'PRINT_OPERATOR' }
  ];

  for (const m of memberRoles) {
    const wh = warehouseMap[m.wh];
    await client.query(`
      INSERT INTO warehouse_memberships (
        id, warehouse_id, user_id, role, status, assigned_by, assigned_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'ACTIVE', $2, NOW(), NOW(), NOW()
      ) ON CONFLICT (warehouse_id, user_id) DO NOTHING
    `, [wh.id, operatorUserId, m.role]);
  }

  // 5. Seed Goods Receipts (Stock In) & Initial Balances
  console.log('Seeding goods receipts and initial balances...');
  const receipts = [
    {
      wh: 'WH-HCM-01',
      mat: 'PLA-WHT-001',
      qty: 15000,
      cost: 320,
      sup: 'eSun Vietnam Distributor',
      batch: 'BATCH-2026-ES-010',
      note: 'Nhập lô 15 cuộn 1kg PLA+ Cold White theo PO #2026-001.',
      daysAgo: 10
    },
    {
      wh: 'WH-HCM-01',
      mat: 'PLA-BLK-002',
      qty: 12000,
      cost: 350,
      sup: 'Polymaker Official Store',
      batch: 'BATCH-2026-PM-044',
      note: 'Nhập 12 cuộn PolyLite Galaxy Black.',
      daysAgo: 9
    },
    {
      wh: 'WH-HCM-01',
      mat: 'PETG-BLU-001',
      qty: 8000,
      cost: 420,
      sup: 'Bambu Lab Direct Vietnam',
      batch: 'BATCH-2026-BL-009',
      note: 'Lô nhựa PETG trong suốt Cyan cho đơn hàng vỏ thiết bị.',
      daysAgo: 8
    },
    {
      wh: 'WH-HN-01',
      mat: 'PLA-WHT-001',
      qty: 10000,
      cost: 320,
      sup: 'eSun Vietnam Distributor',
      batch: 'BATCH-2026-ES-011',
      note: 'Bổ sung tồn kho chi nhánh miền Bắc.',
      daysAgo: 7
    },
    {
      wh: 'WH-HN-01',
      mat: 'ABS-GRY-001',
      qty: 6000,
      cost: 380,
      sup: 'Sunlu Filament Store',
      batch: 'BATCH-2026-SL-032',
      note: 'ABS xám cho phòng mẫu công nghiệp.',
      daysAgo: 6
    },
    {
      wh: 'WH-DN-01',
      mat: 'PLA-WHT-001',
      qty: 5000,
      cost: 320,
      sup: 'eSun Vietnam Distributor',
      batch: 'BATCH-2026-ES-012',
      note: 'Nhập kho chi nhánh Đà Nẵng.',
      daysAgo: 5
    },
    {
      wh: 'WH-OCTO-LAB',
      mat: 'RESIN-SGY-001',
      qty: 10000,
      cost: 750,
      sup: 'Elegoo Vietnam Authorized Partner',
      batch: 'BATCH-2026-EL-8K-001',
      note: '10 bình resin 8K 1000g cho máy in resin LCD.',
      daysAgo: 4
    },
    {
      wh: 'WH-OCTO-LAB',
      mat: 'PACF-BLK-001',
      qty: 3000,
      cost: 1250,
      sup: 'Polymaker High-Temp Line',
      batch: 'BATCH-2026-PM-PACF-02',
      note: '3 cuộn PA6-CF sợi carbon cho chế tạo cơ khí chịu lực.',
      daysAgo: 3
    },
    {
      wh: 'WH-HCM-01',
      mat: 'TPU-ORG-001',
      qty: 4000,
      cost: 580,
      sup: 'Overture 3D Store',
      batch: 'BATCH-2026-OV-TPU-05',
      note: '4 cuộn TPU cam neon đàn hồi cao.',
      daysAgo: 2
    }
  ];

  let receiptCounter = 1;
  for (const r of receipts) {
    const wh = warehouseMap[r.wh];
    const mat = materialMap[r.mat];
    const recNumber = `REC-2026-${String(receiptCounter++).padStart(4, '0')}`;
    const idKey = `IDEM-REC-${recNumber}`;
    const txDate = new Date(Date.now() - r.daysAgo * 86400000);

    await client.query(`
      INSERT INTO stock_receipts (
        id, receipt_number, warehouse_id, material_id, quantity_gram, unit_cost,
        supplier, batch_number, idempotency_key, note, received_by, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
    `, [recNumber, wh.id, mat.id, r.qty, r.cost, r.sup, r.batch, idKey, r.note, operatorUserId, txDate]);

    const existingBal = await client.query(`
      SELECT id, on_hand_gram, reserved_gram FROM inventory_balances
      WHERE warehouse_id = $1 AND material_id = $2
    `, [wh.id, mat.id]);

    let beforeOnHand = 0;
    let afterOnHand = r.qty;
    if (existingBal.rows.length > 0) {
      beforeOnHand = parseFloat(existingBal.rows[0].on_hand_gram);
      afterOnHand = beforeOnHand + r.qty;
      await client.query(`
        UPDATE inventory_balances
        SET on_hand_gram = on_hand_gram + $1, updated_at = NOW()
        WHERE id = $2
      `, [r.qty, existingBal.rows[0].id]);
    } else {
      await client.query(`
        INSERT INTO inventory_balances (
          id, warehouse_id, material_id, on_hand_gram, reserved_gram, version, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, 0, 0, NOW()
        )
      `, [wh.id, mat.id, r.qty]);
    }

    await insertLedger({
      type: 'RECEIPT',
      warehouseId: wh.id,
      materialId: mat.id,
      deltaOnHand: r.qty,
      deltaReserved: 0,
      beforeOnHand: beforeOnHand,
      afterOnHand: afterOnHand,
      beforeReserved: 0,
      afterReserved: 0,
      referenceId: recNumber,
      idempotencyKey: idKey,
      createdAt: txDate
    });
  }

  // 6. Seed Manual Issues (Stock Out)
  console.log('Seeding manual issues...');
  const issues = [
    {
      wh: 'WH-HCM-01',
      mat: 'PLA-BLK-002',
      qty: 500,
      reason: 'PRINTER_NOZZLE_CALIBRATION',
      note: 'Xuất 500g cuộn PLA đen kiểm tra cân chỉnh bàn nhiệt và áp suất vòi phun máy Voron 2.4.',
      daysAgo: 3
    },
    {
      wh: 'WH-HN-01',
      mat: 'ABS-GRY-001',
      qty: 800,
      reason: 'EXHIBITION_PROTOTYPE_DEMO',
      note: 'Xuất 800g ABS xám gia công tượng trưng bày tại TechExpo Hà Nội 2026.',
      daysAgo: 2
    },
    {
      wh: 'WH-OCTO-LAB',
      mat: 'PACF-BLK-001',
      qty: 400,
      reason: 'RND_STRENGTH_TESTING',
      note: 'Thử nghiệm kéo giãn và độ cong uốn chịu nhiệt theo chuẩn ASTM D638.',
      daysAgo: 1
    }
  ];

  let issueCounter = 1;
  for (const iss of issues) {
    const wh = warehouseMap[iss.wh];
    const mat = materialMap[iss.mat];
    const issueNum = `ISS-2026-${String(issueCounter++).padStart(4, '0')}`;
    const idKey = `IDEM-ISS-${issueNum}`;
    const txDate = new Date(Date.now() - iss.daysAgo * 86400000);

    await client.query(`
      INSERT INTO stock_issues (
        id, issue_number, warehouse_id, material_id, quantity_gram, reason,
        idempotency_key, note, issued_by, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9
      )
    `, [issueNum, wh.id, mat.id, iss.qty, iss.reason, idKey, iss.note, operatorUserId, txDate]);

    const bal = await client.query(`
      SELECT id, on_hand_gram, reserved_gram FROM inventory_balances
      WHERE warehouse_id = $1 AND material_id = $2
    `, [wh.id, mat.id]);

    const beforeOnHand = parseFloat(bal.rows[0].on_hand_gram);
    const afterOnHand = beforeOnHand - iss.qty;
    const reserved = parseFloat(bal.rows[0].reserved_gram);

    await client.query(`
      UPDATE inventory_balances
      SET on_hand_gram = on_hand_gram - $1, updated_at = NOW()
      WHERE id = $2
    `, [iss.qty, bal.rows[0].id]);

    await insertLedger({
      type: 'ISSUE',
      warehouseId: wh.id,
      materialId: mat.id,
      deltaOnHand: -iss.qty,
      deltaReserved: 0,
      beforeOnHand: beforeOnHand,
      afterOnHand: afterOnHand,
      beforeReserved: reserved,
      afterReserved: reserved,
      referenceId: issueNum,
      idempotencyKey: idKey,
      createdAt: txDate
    });
  }

  // 7. Seed Print Jobs across lifecycle (F06 & F07)
  console.log('Seeding print jobs, reservations, consumptions...');
  
  // JOB 1: COMPLETED + Reconciled (400g reserved, 400g issued, 350g used + 30g waste + 20g returned)
  {
    const wh = warehouseMap['WH-HCM-01'];
    const mat = materialMap['PLA-WHT-001'];
    const tStart = new Date(Date.now() - 48 * 3600000);
    const tEnd = new Date(Date.now() - 24 * 3600000);

    const jobRes = await client.query(`
      INSERT INTO print_jobs (
        id, job_number, material_id, status, estimated_gram,
        estimated_duration_seconds, started_at, ended_at, created_by, version, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 'JOB-2026-001', $1, 'COMPLETED', 400, 14400,
        $2, $3, $4, 3, $2, $3
      ) RETURNING id
    `, [mat.id, tStart, tEnd, operatorUserId]);
    const jobId = jobRes.rows[0].id;

    // Reservation (FULFILLED)
    await client.query(`
      INSERT INTO stock_reservations (
        id, print_job_id, warehouse_id, material_id, reserved_gram, status, created_by, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 400, 'FULFILLED', $4, $5, $5
      )
    `, [jobId, wh.id, mat.id, operatorUserId, tStart]);

    // Consumption (350 used, 30 waste, 20 returned -> matches 400)
    await client.query(`
      INSERT INTO print_job_consumptions (
        id, print_job_id, warehouse_id, material_id,
        issued_gram, used_gram, waste_gram, returned_gram,
        reconciled, reconciled_at, reconciled_by, note, version, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 400, 350, 30, 20,
        true, $4, $5, 'In hoàn tất tượng mô hình 3D, thừa 20g trả lại kho Tân Bình.', 0, $4, $4
      )
    `, [jobId, wh.id, mat.id, tEnd, operatorUserId]);

    const bal = await client.query(`SELECT id, on_hand_gram, reserved_gram FROM inventory_balances WHERE warehouse_id = $1 AND material_id = $2`, [wh.id, mat.id]);
    const curOn = parseFloat(bal.rows[0].on_hand_gram);

    // Ledger: RESERVATION_HOLD (400)
    await insertLedger({
      type: 'RESERVATION_HOLD',
      warehouseId: wh.id,
      materialId: mat.id,
      deltaOnHand: 0,
      deltaReserved: 400,
      beforeOnHand: curOn,
      afterOnHand: curOn,
      beforeReserved: 0,
      afterReserved: 400,
      printJobId: jobId,
      referenceId: 'JOB-2026-001',
      createdAt: tStart
    });

    // Ledger: PRINT_ISSUE (-400 on_hand, -400 reserved)
    await insertLedger({
      type: 'PRINT_ISSUE',
      warehouseId: wh.id,
      materialId: mat.id,
      deltaOnHand: -400,
      deltaReserved: -400,
      beforeOnHand: curOn,
      afterOnHand: curOn - 400,
      beforeReserved: 400,
      afterReserved: 0,
      printJobId: jobId,
      referenceId: 'JOB-2026-001',
      createdAt: new Date(Date.now() - 36 * 3600000)
    });

    // Ledger: PRINT_RETURN (+20 on_hand)
    await insertLedger({
      type: 'PRINT_RETURN',
      warehouseId: wh.id,
      materialId: mat.id,
      deltaOnHand: 20,
      deltaReserved: 0,
      beforeOnHand: curOn - 400,
      afterOnHand: curOn - 380,
      beforeReserved: 0,
      afterReserved: 0,
      printJobId: jobId,
      referenceId: 'JOB-2026-001',
      createdAt: tEnd
    });

    await client.query(`
      UPDATE inventory_balances SET on_hand_gram = on_hand_gram - 380 WHERE id = $1
    `, [bal.rows[0].id]);
  }

  // JOB 2: PRINTING (In Progress: 650g issued, printer printing)
  {
    const wh = warehouseMap['WH-OCTO-LAB'];
    const mat = materialMap['PACF-BLK-001'];
    const tStart = new Date(Date.now() - 4 * 3600000);
    const tCreate = new Date(Date.now() - 12 * 3600000);

    const jobRes = await client.query(`
      INSERT INTO print_jobs (
        id, job_number, material_id, status, estimated_gram,
        estimated_duration_seconds, started_at, created_by, version, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 'JOB-2026-002', $1, 'PRINTING', 650, 28800,
        $2, $3, 2, $4, $2
      ) RETURNING id
    `, [mat.id, tStart, operatorUserId, tCreate]);
    const jobId = jobRes.rows[0].id;

    await client.query(`
      INSERT INTO stock_reservations (
        id, print_job_id, warehouse_id, material_id, reserved_gram, status, created_by, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 650, 'FULFILLED', $4, $5, $6
      )
    `, [jobId, wh.id, mat.id, operatorUserId, tCreate, tStart]);

    const bal = await client.query(`SELECT id, on_hand_gram FROM inventory_balances WHERE warehouse_id = $1 AND material_id = $2`, [wh.id, mat.id]);
    const curOn = parseFloat(bal.rows[0].on_hand_gram);

    await insertLedger({
      type: 'RESERVATION_HOLD',
      warehouseId: wh.id,
      materialId: mat.id,
      deltaOnHand: 0,
      deltaReserved: 650,
      beforeOnHand: curOn,
      afterOnHand: curOn,
      beforeReserved: 0,
      afterReserved: 650,
      printJobId: jobId,
      referenceId: 'JOB-2026-002',
      createdAt: tCreate
    });

    await insertLedger({
      type: 'PRINT_ISSUE',
      warehouseId: wh.id,
      materialId: mat.id,
      deltaOnHand: -650,
      deltaReserved: -650,
      beforeOnHand: curOn,
      afterOnHand: curOn - 650,
      beforeReserved: 650,
      afterReserved: 0,
      printJobId: jobId,
      referenceId: 'JOB-2026-002',
      createdAt: tStart
    });

    await client.query(`
      UPDATE inventory_balances SET on_hand_gram = on_hand_gram - 650 WHERE id = $1
    `, [bal.rows[0].id]);
  }

  // JOB 3: RESERVED (500g reserved at WH-HCM-01, awaiting issue)
  {
    const wh = warehouseMap['WH-HCM-01'];
    const mat = materialMap['PETG-BLU-001'];
    const tCreate = new Date(Date.now() - 6 * 3600000);

    const jobRes = await client.query(`
      INSERT INTO print_jobs (
        id, job_number, material_id, status, estimated_gram,
        estimated_duration_seconds, created_by, version, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 'JOB-2026-003', $1, 'RESERVED', 500, 18000,
        $2, 1, $3, $3
      ) RETURNING id
    `, [mat.id, operatorUserId, tCreate]);
    const jobId = jobRes.rows[0].id;

    await client.query(`
      INSERT INTO stock_reservations (
        id, print_job_id, warehouse_id, material_id, reserved_gram, status, created_by, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 500, 'ACTIVE', $4, $5, $5
      )
    `, [jobId, wh.id, mat.id, operatorUserId, tCreate]);

    const bal = await client.query(`SELECT id, on_hand_gram, reserved_gram FROM inventory_balances WHERE warehouse_id = $1 AND material_id = $2`, [wh.id, mat.id]);
    const curOn = parseFloat(bal.rows[0].on_hand_gram);
    const curRes = parseFloat(bal.rows[0].reserved_gram);

    await insertLedger({
      type: 'RESERVATION_HOLD',
      warehouseId: wh.id,
      materialId: mat.id,
      deltaOnHand: 0,
      deltaReserved: 500,
      beforeOnHand: curOn,
      afterOnHand: curOn,
      beforeReserved: curRes,
      afterReserved: curRes + 500,
      printJobId: jobId,
      referenceId: 'JOB-2026-003',
      createdAt: tCreate
    });

    await client.query(`
      UPDATE inventory_balances SET reserved_gram = reserved_gram + 500 WHERE id = $1
    `, [bal.rows[0].id]);
  }

  // JOB 4: CREATED (New job awaiting warehouse allocation)
  {
    const mat = materialMap['TPU-ORG-001'];
    await client.query(`
      INSERT INTO print_jobs (
        id, job_number, material_id, status, estimated_gram,
        estimated_duration_seconds, created_by, version, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 'JOB-2026-004', $1, 'CREATED', 320, 10800,
        $2, 0, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'
      )
    `, [mat.id, operatorUserId]);
  }

  // JOB 5: ISSUED (Material issued from warehouse, queued for printing)
  {
    const wh = warehouseMap['WH-OCTO-LAB'];
    const mat = materialMap['RESIN-SGY-001'];
    const tCreate = new Date(Date.now() - 5 * 3600000);
    const tIssue = new Date(Date.now() - 1 * 3600000);

    const jobRes = await client.query(`
      INSERT INTO print_jobs (
        id, job_number, material_id, status, estimated_gram,
        estimated_duration_seconds, created_by, version, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 'JOB-2026-005', $1, 'ISSUED', 450, 21600,
        $2, 2, $3, $4
      ) RETURNING id
    `, [mat.id, operatorUserId, tCreate, tIssue]);
    const jobId = jobRes.rows[0].id;

    await client.query(`
      INSERT INTO stock_reservations (
        id, print_job_id, warehouse_id, material_id, reserved_gram, status, created_by, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 450, 'FULFILLED', $4, $5, $6
      )
    `, [jobId, wh.id, mat.id, operatorUserId, tCreate, tIssue]);

    const bal = await client.query(`SELECT id, on_hand_gram FROM inventory_balances WHERE warehouse_id = $1 AND material_id = $2`, [wh.id, mat.id]);
    const curOn = parseFloat(bal.rows[0].on_hand_gram);

    await insertLedger({
      type: 'RESERVATION_HOLD',
      warehouseId: wh.id,
      materialId: mat.id,
      deltaOnHand: 0,
      deltaReserved: 450,
      beforeOnHand: curOn,
      afterOnHand: curOn,
      beforeReserved: 0,
      afterReserved: 450,
      printJobId: jobId,
      referenceId: 'JOB-2026-005',
      createdAt: tCreate
    });

    await insertLedger({
      type: 'PRINT_ISSUE',
      warehouseId: wh.id,
      materialId: mat.id,
      deltaOnHand: -450,
      deltaReserved: -450,
      beforeOnHand: curOn,
      afterOnHand: curOn - 450,
      beforeReserved: 450,
      afterReserved: 0,
      printJobId: jobId,
      referenceId: 'JOB-2026-005',
      createdAt: tIssue
    });

    await client.query(`
      UPDATE inventory_balances SET on_hand_gram = on_hand_gram - 450 WHERE id = $1
    `, [bal.rows[0].id]);
  }

  console.log('✅ All warehouse flow data successfully seeded!');
  await client.end();
}

main().catch(console.error);
