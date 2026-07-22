import React from 'react';
import { Pagination } from 'react-bootstrap';
import PropTypes from 'prop-types';

const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    let items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First and Prev
    items.push(
        <Pagination.First key="first" disabled={currentPage === 1} onClick={() => onPageChange(1)} />
    );
    items.push(
        <Pagination.Prev key="prev" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} />
    );

    // Ellipsis start
    if (startPage > 1) {
        items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
    }

    // Page numbers
    for (let number = startPage; number <= endPage; number++) {
        items.push(
            <Pagination.Item key={number} active={number === currentPage} onClick={() => onPageChange(number)}>
                {number}
            </Pagination.Item>
        );
    }

    // Ellipsis end
    if (endPage < totalPages) {
        items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
    }

    // Next and Last
    items.push(
        <Pagination.Next key="next" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} />
    );
    items.push(
        <Pagination.Last key="last" disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)} />
    );

    return (
        <div className="d-flex justify-content-end mt-3">
            <Pagination size="sm" className="mb-0 shadow-sm">
                {items}
            </Pagination>
        </div>
    );
};

CustomPagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default CustomPagination;
