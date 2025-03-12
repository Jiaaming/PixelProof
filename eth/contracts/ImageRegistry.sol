// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title 图片版权登记合约
 * @dev 允许用户将图片哈希与创作者地址绑定，记录不可篡改的版权信息
 */
contract ImageRegistry {
    // 事件：当新图片哈希被注册时触发
    event Registered(
        address indexed author,
        bytes32 indexed hash,
        uint256 timestamp
    );

    // 状态变量
    mapping(bytes32 => address) private _hashToOwner; // 哈希到所有者的映射
    mapping(address => bytes32[]) private _ownerToHashes; // 所有者到哈希列表的映射

    // 错误类型
    error HashAlreadyRegistered(bytes32 hash);
    error InvalidHash();
    error Unauthorized();

    /**
     * @dev 注册单个图片哈希
     * @param _hash 图片的SHA-256哈希值（32字节）
     */
    function registerImage(bytes32 _hash) external {
        // 输入验证
        if (_hash == bytes32(0)) revert InvalidHash();
        if (_hashToOwner[_hash] != address(0)) revert HashAlreadyRegistered(_hash);

        // 记录所有权
        _hashToOwner[_hash] = msg.sender;
        _ownerToHashes[msg.sender].push(_hash);

        // 触发事件
        emit Registered(msg.sender, _hash, block.timestamp);
    }

    /**
     * @dev 批量注册图片哈希（节省Gas）
     * @param _hashes 哈希数组
     */
    function batchRegister(bytes32[] calldata _hashes) external {
        for (uint256 i = 0; i < _hashes.length; i++) {
            bytes32 hash = _hashes[i];
            if (hash == bytes32(0)) revert InvalidHash();
            if (_hashToOwner[hash] != address(0)) continue;

            _hashToOwner[hash] = msg.sender;
            _ownerToHashes[msg.sender].push(hash);
            emit Registered(msg.sender, hash, block.timestamp);
        }
    }

    // ========== 查询函数 ==========
    /**
     * @dev 通过哈希查询所有者
     * @param hash 图片哈希
     * @return 所有者地址
     */
    function getOwner(bytes32 hash) public view returns (address) {
        return _hashToOwner[hash];
    }

    /**
     * @dev 查询地址注册的所有哈希
     * @param owner 所有者地址
     * @return 哈希数组
     */
    function getHashesByOwner(address owner) public view returns (bytes32[] memory) {
        return _ownerToHashes[owner];
    }

    /**
     * @dev 检查哈希是否已被注册
     * @param hash 图片哈希
     * @return 是否已注册
     */
    function isRegistered(bytes32 hash) public view returns (bool) {
        return _hashToOwner[hash] != address(0);
    }
}