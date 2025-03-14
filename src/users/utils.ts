export const filterMapper: Record<
    string,
    { key: string; type: string; operator: string }
> = {
    email: {
        key: "u.email",
        type: "filter",
        operator: "=",
    },
    role: {
        key: "u.role",
        type: "filter",
        operator: "=",
    },
    status: {
        key: "u.status",
        type: "filter",
        operator: "=",
    },
    college: {
        key: "u.college_id",
        type: "filter",
        operator: "=",
    },
    department: {
        key: "u.department_id",
        type: "filter",
        operator: "=",
    },
};

export const sortMapper: Record<
    string,
    { key: string; type: string; operator: string }
> = {
    created_at: {
        key: "u.created_at",
        type: "sort",
        operator: "ORDER BY u.created_at ?, u.id ?",
    },
    first_name: {
        key: "u.first_name",
        type: "sort",
        operator: " ORDER BY u.first_name ?, u.id ? ",
    },
    last_name: {
        key: "u.last_name",
        type: "sort",
        operator: "ORDER BY u.first_name ?, u.id ?",
    },
};

export const buildSortQuery = (
    cursor_id: string,
    cursor: string | number,
    sort_order: string,
    sort_by: string
) => {
    const sortOrder = sort_order === "ASC" ? "ASC" : "DESC";
    const sortFilter = sort_order === "ASC" ? "<" : ">";
    const sortDetails = sortMapper[sort_by];
    const sortFilterQuery = `(${sortDetails.key}, id) ${sortFilter} ($?, $?)`;
    const sortOrderByQuery = ` ${sortDetails.operator.replace(
        /\?/g,
        sortOrder
    )} `;

    return {
        sortFilterQuery: cursor ? sortFilterQuery : "",
        sortFilterParams: [cursor, cursor_id],
        sortOrderByQuery,
    };
};

export const buildFilterQuery = (filters: any) => {
    const filterArray: string[] = [];
    const filterParams: any[] = [];

    Object.keys(filters).forEach((key) => {
        const filterDetails = filterMapper[key];
        if (filterDetails) {
            filterArray.push(
                `${filterDetails.key} ${filterDetails.operator} $? `
            );
            filterParams.push(filters[key]);
        }
    });

    return { filterArray, filterParams };
};

export const prepareQuery = (
    filters: any,
    cursor_id: string,
    cursor: string | number,
    sort_order: string,
    sort_by: string
) => {
    const params: any = [];
    let filterQuery = "";
    const { filterArray, filterParams } = buildFilterQuery(filters);
    const { sortFilterQuery, sortFilterParams, sortOrderByQuery } =
        buildSortQuery(cursor_id, cursor, sort_order, sort_by);

    if (!filterArray.length && !sortFilterQuery.length) {
        return { filterQuery, params };
    }

    filterQuery = " WHERE ";
    let counter = 0;

    if (sortFilterQuery?.length) {
        filterQuery += `${sortFilterQuery.replace(
            /\$\?/g,
            () => `$${++counter}`
        )}`;
        params.push(...sortFilterParams);
    }

    if (filterArray?.length) {
        if (counter > 0) {
            filterQuery += ` AND ${filterArray
                .join(" AND ")
                .replace(/\$\?/g, () => `$${++counter}`)}`;
            params.push(...filterParams);
        } else {
            filterQuery += filterArray
                .join(" AND ")
                .replace(/\$\?/g, () => `$${++counter}`);
            params.push(...filterParams);
        }
    }

    return {
        filterQuery,
        params: params.map((i: any) => i.toString()),
        sortOrderByQuery,
    };
};
