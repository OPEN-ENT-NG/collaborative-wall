const CantooAdaptTextBoxView = ({ content }: { content: string }) => {
  const Cantoo = (window as any).Cantoo;
  const renderEditStyle = { border: '1px solid #f2f2f2' };

  const cantooHTML = Cantoo?.formatText(content) || content;

  return (
    <div className="multimedia-section my-24" style={renderEditStyle}>
      <div className="py-12 px-12">
        <div dangerouslySetInnerHTML={{ __html: cantooHTML }} />
      </div>
    </div>
  );
};

export default CantooAdaptTextBoxView;
