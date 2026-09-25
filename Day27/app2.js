const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Initialize Postgres connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mydb',
});

// Allowed columns for sorting to prevent SQL Injection
const ALLOWED_SORT_COLUMNS = ['id', 'name', 'created_at', 'price'];

app.get('/api/products', async (req, res) => {
  try {
    // 1. Extract and sanitize query parameters with defaults
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10)); // Cap limit at 100
    const offset = (page - 1) * limit;

    // Sorting parameters
    const sortBy = ALLOWED_SORT_COLUMNS.includes(req.query.sortBy) 
      ? req.query.sortBy 
      : 'created_at';
    
    const sortOrder = req.query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Filter parameters (e.g., search term and category)
    const search = req.query.search || null;
    const category = req.query.category || null;

    // 2. Dynamically build WHERE conditions and parameters
    const whereClauses = [];
    const queryParams = [];

    if (search) {
      queryParams.push(`%${search}%`);
      whereClauses.push(`name ILIKE $${queryParams.length}`);
    }

    if (category) {
      queryParams.push(category);
      whereClauses.push(`category = $${queryParams.length}`);
    }

    const whereSql = whereClauses.length > 0 
      ? `WHERE ${whereClauses.join(' AND ')}` 
      : '';

    // 3. Query total count for pagination metadata
    const countQuery = `SELECT COUNT(*) FROM products ${whereSql}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalItems = parseInt(countResult.rows[0].count, 10);

    // 4. Query paginated data
    // Add LIMIT and OFFSET to parameters
    const limitParamIndex = queryParams.length + 1;
    const offsetParamIndex = queryParams.length + 2;
    const dataQueryParams = [...queryParams, limit, offset];

    // Safely inject sanitized sortBy and sortOrder directly
    const dataQuery = `
      SELECT id, name, category, price, created_at 
      FROM products 
      ${whereSql}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
    `;

    const dataResult = await pool.query(dataQuery, dataQueryParams);

    // 5. Structure response
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      data: dataResult.rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
