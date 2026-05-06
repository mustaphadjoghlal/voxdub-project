{/* ===== تبويب الطلبات ===== */}
{activeTab === 'orders' && (
  <div className="space-y-4">

    {/* ملاحظات العملاء الواردة */}
    {(() => {
      const feedbacks = adminNotifications.filter(n => n.type === 'client_feedback');
      if (feedbacks.length === 0) return null;
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
          <div className="px-8 py-5 border-b border-orange-100 bg-orange-50">
            <h2 className="text-lg font-black text-orange-800">💬 ملاحظات العملاء ({feedbacks.length})</h2>
            <p className="text-orange-600 font-bold text-xs mt-1">راجع الملاحظات وأرسلها للمعلق المعني</p>
          </div>
          <div className="divide-y divide-orange-50">
            {feedbacks.map((n: any) => {
              const artistName = n.voiceActor;
              const targetArtist = allArtists.find(a => a.name === artistName);
              return (
                <div key={n.id} className={`px-8 py-5 ${!n.read ? 'bg-orange-50/50' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-black text-gray-900 text-sm mb-1">{n.clientName} ← {n.voiceActor}</p>
                      <p className="text-gray-600 font-bold text-sm leading-relaxed bg-gray-50 p-3 rounded-xl mt-2 whitespace-pre-wrap">{n.body?.split('الملاحظات: ')[1] || n.body}</p>
                    </div>
                    {targetArtist && (
                      <button
                        onClick={async () => {
                          const msg = n.body?.split('الملاحظات: ')[1] || n.body;
                          await addDoc(collection(db, 'notifications'), {
                            artistId: targetArtist.id,
                            title: '📝 ملاحظات على طلبك',
                            body: `من العميل ${n.clientName}: ${msg}`,
                            type: 'order_feedback',
                            read: false,
                            createdAt: serverTimestamp(),
                          });
                          alert(`✅ تم إرسال الملاحظات لـ ${artistName}`);
                        }}
                        className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-full font-black text-xs hover:bg-blue-700 transition flex-shrink-0">
                        <Send size={12} /> إرسال للمعلق
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    })()}

    {/* قائمة الطلبات */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {allOrders.length === 0 ? (
        <div className="p-16 text-center"><FileText size={48} className="text-gray-200 mx-auto mb-4" /><p className="text-gray-400 font-black">لا توجد طلبات</p></div>
      ) : (
        <div className="divide-y divide-gray-50">
          {allOrders.map(order => {
            const status = statusConfig[order.status] || statusConfig.pending;
            return (
              <div key={order.id} className="px-8 py-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-black text-gray-900">{order.selectedPackage}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${status.color}`}>{status.label}</span>
                    </div>
                    <p className="text-gray-500 font-bold text-sm">العميل: <span className="text-gray-700">{order.clientName || '—'}</span></p>
                    <p className="text-gray-500 font-bold text-sm">المعلق: <span className="text-gray-700">{order.selectedVoiceActor}</span></p>
                    <p className="text-gray-500 font-bold text-sm">نوع العمل: <span className="text-gray-700">{order.workType}</span></p>
                  </div>
                  <select value={order.status || 'pending'} onChange={e => handleStatusChange(order.id, e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl py-2 px-3 text-gray-700 font-bold text-sm outline-none focus:border-red-400 flex-shrink-0">
                    {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                {/* النص الكامل */}
                {order.description && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-2">
                    <p className="text-xs font-black text-blue-700 mb-1">📄 النص / تفاصيل المشروع:</p>
                    <p className="text-gray-700 font-bold text-sm leading-relaxed whitespace-pre-wrap">{order.description}</p>
                  </div>
                )}

                {/* الملف المرفق */}
                {order.fileAttachmentURL && (
                  <a href={order.fileAttachmentURL} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-black text-xs hover:bg-emerald-100 transition">
                    <Download size={14} /> تحميل الملف المرفق
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
)}
