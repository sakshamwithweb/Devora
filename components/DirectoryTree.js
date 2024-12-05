'use client';
import { useState } from 'react';

const DirectoryTree = ({ structure, ignoreThings, setIgnoreThings }) => {
  const [expanded, setExpanded] = useState({});

  const handleToggle = (name) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleCheckboxChange = (item, isChecked) => {
    const itemPath = item.type === 'directory' ? `${item.name}/` : item.name;

    if (item.type === 'directory') {
      const allChildren = getAllChildPaths(item);
      if (isChecked) {
        setIgnoreThings((prev) => [...new Set([...prev, itemPath, ...allChildren])]);
      } else {
        setIgnoreThings((prev) => prev.filter((i) => ![itemPath, ...allChildren].includes(i)));
      }
    } else {
      setIgnoreThings((prev) =>
        prev.includes(itemPath) ? prev.filter((i) => i !== itemPath) : [...prev, itemPath]
      );
    }
  };

  const getAllChildPaths = (parent) => {
    let paths = [];
    if (parent.children) {
      parent.children.forEach((child) => {
        const childPath = child.type === 'directory' ? `${child.name}/` : child.name;
        paths.push(childPath);
        if (child.type === 'directory') {
          paths = [...paths, ...getAllChildPaths(child)];
        }
      });
    }
    return paths;
  };

  return (
    <ul className="pl-2">
      {structure.map((item, index) => (
        <li key={index} className="mb-2">
          <div className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-1">
            {item.type === 'directory' && (
              <button
                onClick={() => handleToggle(item.name)}
                className="text-blue-500 hover:underline transition duration-200 ease-in-out"
              >
                {expanded[item.name] ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                )}
              </button>
            )}
            <input
              type="checkbox"
              checked={ignoreThings.includes(
                item.type === 'directory' ? `${item.name}/` : item.name
              )}
              onChange={(e) => handleCheckboxChange(item, e.target.checked)}
              className="h-4 w-4 rounded-sm border-gray-400 focus:ring-blue-500 transition duration-200 ease-in-out"
            />
            <span className="text-gray-800 font-medium text-sm">
              {item.name} {item.type === 'directory' ? '/' : ''}
            </span>
          </div>
          {item.type === 'directory' && expanded[item.name] && (
            <DirectoryTree
              structure={item.children || []}
              ignoreThings={ignoreThings}
              setIgnoreThings={setIgnoreThings}
            />
          )}
        </li>
      ))}
    </ul>
  );
};

export default DirectoryTree;